import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuroGYMSVbcmX6jkQqsizdeQ4T9LEF6fo",
  authDomain: "yatrasathi-a341c.firebaseapp.com",
  projectId: "yatrasathi-a341c",
  storageBucket: "yatrasathi-a341c.firebasestorage.app",
  messagingSenderId: "110414933268",
  appId: "1:110414933268:web:5c28d7e1b7f46996ca2601",
  measurementId: "G-Y5QQRQMVHK"
};

// Initialize Firebase App globally to avoid re-initialization on HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
