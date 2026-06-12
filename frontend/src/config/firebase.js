import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
    authDomain: "baksha-d6af1.firebaseapp.com",
    projectId: "baksha-d6af1",
    storageBucket: "baksha-d6af1.firebasestorage.app",
    messagingSenderId: "1000632616535",
    appId: "1:1000632616535:web:5841a1627a3e609988c512",
    measurementId: "G-L4MXKVGCJM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
