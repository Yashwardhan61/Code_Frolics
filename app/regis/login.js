// login.js — Firebase Authentication (email/password) integration
// Save alongside login.html and login.css
// IMPORTANT: Replace the firebaseConfig object with your project's values
// This file uses the Firebase v9+ modular SDK via CDN imports (ES modules).
//
// Usage:
// 1. Make sure your web hosting serves this file as a module (login.html should
//    include: <script type="module" src="login.js"></script>).
// 2. Enable Email/Password sign-in in your Firebase Console (Authentication > Sign-in method).
// 3. Replace firebaseConfig values below.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/* ============ CONFIG: REPLACE WITH YOUR FIREBASE PROJECT CONFIG ============ */
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};
/* ========================================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const togglePass = document.getElementById("togglePass");
const messageEl = document.getElementById("message");
const demoBtn = document.getElementById("demoBtn");
const rememberCheckbox = document.getElementById("remember");

// helper to show a message
function showMessage(text, type = "error", autoHide = true) {
  messageEl.style.display = "block";
  messageEl.className = "message " + (type === "success" ? "success" : "error");
  messageEl.textContent = text;
  if (autoHide) {
    setTimeout(() => {
      messageEl.style.display = "none";
    }, 4000);
  }
}

// toggle password visibility
togglePass?.addEventListener("click", () => {
  if (!passwordEl) return;
  const isHidden = passwordEl.type === "password";
  passwordEl.type = isHidden ? "text" : "password";
  togglePass.textContent = isHidden ? "Hide" : "Show";
  togglePass.setAttribute("aria-pressed", String(isHidden));
});

// quick demo fill (keeps same UI behavior)
demoBtn?.addEventListener("click", () => {
  emailEl.value = "demo@example.com";
  passwordEl.value = "demo1234";
  showMessage("Demo credentials filled. Click Sign in to continue.", "success");
});

// Map Firebase Auth error codes to friendly messages
function friendlyErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again or reset your password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Authentication failed. (" + code + ")";
  }
}

// attempt sign-in using Firebase Auth
async function signInWithFirebase(email, password, remember) {
  try {
    // Choose persistence based on "remember me"
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);
    // credential.user contains the authenticated user
    showMessage("Welcome back! Signing in...", "success", false);

    // Example: redirect to dashboard or homepage after success
    // Replace '#' with your actual app route.
    setTimeout(() => {
      window.location.href = "/dashboard.html"; // <-- change as needed
    }, 800);
  } catch (err) {
    const code = err.code || err?.message || "unknown";
    showMessage(friendlyErrorMessage(code));
    console.error("Firebase sign-in error:", err);
  }
}

// Form submission handler
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (emailEl.value || "").trim();
  const password = passwordEl.value || "";
  const remember = rememberCheckbox?.checked || false;

  // Basic client-side validation
  if (!email || !email.includes("@")) {
    showMessage("Please enter a valid email address.");
    return;
  }
  if (!password || password.length < 6) {
    showMessage("Password must be at least 6 characters.");
    return;
  }

  // Disable controls while authenticating
  const controls = form.querySelectorAll("input, button, a");
  controls.forEach((c) => (c.disabled = true));

  try {
    await signInWithFirebase(email, password, remember);
  } finally {
    // Re-enable controls (if redirect doesn't happen)
    controls.forEach((c) => (c.disabled = false));
  }
});

// Optional: watch auth state and act if user already signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in.
    // If you want to auto-redirect already authenticated users away from the login page:
    // window.location.href = "/dashboard.html"; // <-- change as needed
    console.log("User is signed in:", user.email);
  } else {
    // No user signed in.
    console.log("No user signed in.");
  }
});
