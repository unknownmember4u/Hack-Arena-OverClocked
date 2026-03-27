import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDuroGYMSVbcmX6jkQqsizdeQ4T9LEF6fo',
  authDomain: 'yatrasathi-a341c.firebaseapp.com',
  projectId: 'yatrasathi-a341c',
  storageBucket: 'yatrasathi-a341c.firebasestorage.app',
  messagingSenderId: '110414933268',
  appId: '1:110414933268:web:5c28d7e1b7f46996ca2601',
  measurementId: 'G-Y5QQRQMVHK',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
