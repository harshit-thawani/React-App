// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-24c44.firebaseapp.com",
  projectId: "react-chat-24c44",
  storageBucket: "react-chat-24c44.appspot.com",
  messagingSenderId: "426274525389",
  appId: "1:426274525389:web:ac0fa00ff7dcc1c831d984"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db= getFirestore()
export const storage= getStorage()