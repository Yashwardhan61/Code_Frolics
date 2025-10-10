/* ===== Firebase Configuration and Setup ===== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getDatabase,
    ref as dbRef,
    push,
    set,
    onValue,
    query,
    orderByChild
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
    authDomain: "baksha-d6af1.firebaseapp.com",
    projectId: "baksha-d6af1",
    storageBucket: "baksha-d6af1.firebasestorage.app",
    messagingSenderId: "1000632616535",
    appId: "1:1000632616535:web:5841a1627a3e609988c512",
    databaseURL: "https://baksha-d6af1-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* ===== Form Elements ===== */
const feedbackForm = document.getElementById('feedbackForm');
const submitButton = document.querySelector('.submit-button');
const statusMessage = document.createElement('div');
statusMessage.className = 'status-message';
feedbackForm.appendChild(statusMessage);

/* ===== Form Submission Handler ===== */
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button during submission
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';
    
    try {
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const feedbackType = document.getElementById('feedback-type').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value || '';
        const message = document.getElementById('message').value.trim();

        // Validate required fields
        if (!name || !email || !message) {
            throw new Error('Please fill in all required fields');
        }

        // Create feedback object
        const feedbackData = {
            name,
            email,
            feedbackType,
            rating: Number(rating),
            message,
            timestamp: Date.now(),
            status: 'new' // for tracking feedback status
        };

        // Get reference to feedback in database
        const feedbackRef = dbRef(db, 'feedback');
        const newFeedbackRef = push(feedbackRef);

        // Save to Firebase
        await set(newFeedbackRef, feedbackData);

        // Show success message with animation
        showStatus('Thank you for your feedback! We truly appreciate it ❤️', 'success');
        
        // Reset form
        feedbackForm.reset();

    } catch (error) {
        console.error('Feedback submission error:', error);
        showStatus(error.message || 'Failed to submit feedback. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    }
});

/* ===== Helper Functions ===== */
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.opacity = '1';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        statusMessage.style.opacity = '0';
    }, 5000);
}

// Add CSS for status message
const style = document.createElement('style');
style.textContent = `
    .status-message {
        margin-top: 15px;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        transition: opacity 0.3s ease;
        opacity: 0;
    }

    .status-message.success {
        background-color: rgba(76, 175, 80, 0.1);
        color: #2e7d32;
        border: 1px solid #2e7d32;
    }

    .status-message.error {
        background-color: rgba(244, 67, 54, 0.1);
        color: #d32f2f;
        border: 1px solid #d32f2f;
    }

    .submit-button:disabled {
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);