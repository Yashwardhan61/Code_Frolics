// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Initialize Firebase with your configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
    authDomain: "baksha-d6af1.firebaseapp.com",
    projectId: "baksha-d6af1",
    storageBucket: "baksha-d6af1.firebasestorage.app",
    messagingSenderId: "1000632616535",
    appId: "1:1000632616535:web:5841a1627a3e609988c512",
    measurementId: "G-L4MXKVGCJM"
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');
const analytics = getAnalytics(app);
const auth = getAuth(app);
console.log('Firebase Auth initialized');

// Alert function for user feedback
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg transition-all transform translate-y-0 opacity-100`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.add('opacity-0', 'translate-y-[-1rem]');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match!');
            }
            
            submitButton.innerHTML = 'Creating Account...';
            submitButton.disabled = true;

            console.log('Creating user with email and password...');
            const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
            console.log('User created successfully, updating profile...');
            await updateProfile(userCredential.user, { displayName: name });
            console.log('Profile updated successfully');
            
            showAlert('Registration successful! You can now login.', 'success');
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            showAlert(error.message, 'error');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
});