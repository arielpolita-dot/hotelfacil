// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-vb8B3g-g_b7XRTt8Zh1DNWEoZ8GKVAE",
  authDomain: "hotelfacil-850d1.firebaseapp.com",
  projectId: "hotelfacil-850d1",
  storageBucket: "hotelfacil-850d1.firebasestorage.app",
  messagingSenderId: "653289515883",
  appId: "1:653289515883:web:652cb9f1957f456214fa2e",
  measurementId: "G-JFZ48BJERZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
