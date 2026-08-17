import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "baksha-d6af1.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "baksha-d6af1",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "baksha-d6af1.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1000632616535",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1000632616535:web:5841a1627a3e609988c512",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L4MXKVGCJM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
