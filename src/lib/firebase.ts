// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD15_HsToGGNWFCrQpzzbZY7GeUAYjg3Eo",
  authDomain: "mo3idi-37e58.firebaseapp.com",
  projectId: "mo3idi-37e58",
  storageBucket: "mo3idi-37e58.firebasestorage.app",
  messagingSenderId: "190016530193",
  appId: "1:190016530193:web:8930f7ed67a1493b298eb0",
  measurementId: "G-JS9ZG9L6YT",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log("Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);