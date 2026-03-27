/**
 * Firestore typed helpers for properties, property requests, and users.
 */

import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Property } from '@/types/property';

/* ────────────────────────────────────────────────
   User profile in Firestore
   ──────────────────────────────────────────────── */

export interface FirestoreUser {
  uid: string;
  name: string;
  age: number;
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: unknown;
}

export async function createUserProfile(uid: string, data: Omit<FirestoreUser, 'uid' | 'createdAt'>) {
  await setDoc(doc(db, 'users', uid), { ...data, uid, createdAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

/* ────────────────────────────────────────────────
   Properties (approved, live on map)
   ──────────────────────────────────────────────── */

export async function getAllProperties(): Promise<Property[]> {
  const snap = await getDocs(collection(db, 'properties'));
  return snap.docs.map((d) => d.data() as Property);
}

/** Real-time listener for properties */
export function onPropertiesSnapshot(cb: (props: Property[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'properties'), (snap) => {
    cb(snap.docs.map((d) => d.data() as Property));
  });
}

export async function addProperty(prop: Property): Promise<void> {
  await setDoc(doc(db, 'properties', prop.id), prop);
}

export async function deleteProperty(id: string): Promise<void> {
  await deleteDoc(doc(db, 'properties', id));
}

/* ────────────────────────────────────────────────
   Property Requests (pending owner submissions)
   ──────────────────────────────────────────────── */

export interface PropertyRequest {
  reqId: string;
  // All property fields
  type: string;
  title: string;
  bhk?: number;
  location: { area: string; address: string; lat: number; lng: number };
  rent_price: number;
  gender_preference: string;
  available_from: string;
  transport_modes: string[];
  amenities: { in_unit: string[]; shared: string[] };
  image_url: string;
  papersImageUrl: string;
  // Meta
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: unknown;
  reviewedAt?: unknown;
}

export async function submitPropertyRequest(data: Omit<PropertyRequest, 'reqId' | 'submittedAt' | 'status'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'propertyRequests'), {
    ...data,
    status: 'pending',
    submittedAt: serverTimestamp(),
  });
  await updateDoc(docRef, { reqId: docRef.id });
  return docRef.id;
}

export async function getPendingRequests(): Promise<PropertyRequest[]> {
  const q = query(collection(db, 'propertyRequests'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), reqId: d.id }) as PropertyRequest);
}

export async function getOwnerRequests(ownerId: string): Promise<PropertyRequest[]> {
  const q = query(collection(db, 'propertyRequests'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), reqId: d.id }) as PropertyRequest);
}

/** Approve a pending request → copy to properties collection */
export async function approveRequest(req: PropertyRequest): Promise<void> {
  const propId = 'P' + Date.now();
  const property: Property = {
    id: propId,
    type: req.type as Property['type'],
    title: req.title,
    bhk: req.bhk,
    location: { ...req.location },
    rent_price: req.rent_price,
    is_for_sale: false,
    selling_price: null,
    rooms: null,
    gender_preference: req.gender_preference as Property['gender_preference'],
    commute_time_min: 0,
    transport_modes: req.transport_modes as Property['transport_modes'],
    amenities: req.amenities,
    nearby: [],
    owner: { name: req.ownerName, contact: '', verified: true },
    images: [req.image_url],
    image_url: req.image_url,
    rating: 0,
    available_from: req.available_from,
  };
  await addProperty(property);
  await updateDoc(doc(db, 'propertyRequests', req.reqId), {
    status: 'approved',
    reviewedAt: serverTimestamp(),
  });
}

export async function denyRequest(reqId: string): Promise<void> {
  await updateDoc(doc(db, 'propertyRequests', reqId), {
    status: 'denied',
    reviewedAt: serverTimestamp(),
  });
}

/* ────────────────────────────────────────────────
   File upload helpers
   ──────────────────────────────────────────────── */

export async function uploadPropertyImage(file: File, folder: string): Promise<string> {
  const storageRef = ref(storage, folder + '/' + Date.now() + '_' + file.name);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
