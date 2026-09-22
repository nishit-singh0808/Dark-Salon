// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ for images

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAiANHUQJIv8m3y7ZtbDAgnR086VqjlEiQ",
  authDomain: "darkglamsalon.firebaseapp.com",
  projectId: "darkglamsalon",
  storageBucket: "darkglamsalon.appspot.com", // ✅ fixed (remove `.storage.app`)
  messagingSenderId: "740716103832",
  appId: "1:740716103832:web:65ffad977de7a2105da8ed",
  measurementId: "G-S1HXLMG7C3",
};

// ✅ Initialize app once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ for uploading images

// ✅ Google provider (forces account selection every time)
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { auth, db, storage, provider };
