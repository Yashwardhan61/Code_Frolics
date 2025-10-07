import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// 🔹 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
  authDomain: "baksha-d6af1.firebaseapp.com",
  projectId: "baksha-d6af1",
  storageBucket: "baksha-d6af1.firebasestorage.app",
  messagingSenderId: "1000632616535",
  appId: "1:1000632616535:web:5841a1627a3e609988c512",
  measurementId: "G-L4MXKVGCJM"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 DOM elements
const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const togglePass = document.getElementById("togglePass");
const messageEl = document.getElementById("message");
const demoBtn = document.getElementById("demoBtn");
const rememberCheckbox = document.getElementById("remember");

// 🔹 Show message helper
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

// 🔹 Toggle password visibility
togglePass?.addEventListener("click", () => {
  if (!passwordEl) return;
  const isHidden = passwordEl.type === "password";
  passwordEl.type = isHidden ? "text" : "password";
  togglePass.textContent = isHidden ? "Hide" : "Show";
  togglePass.setAttribute("aria-pressed", String(isHidden));
});

// 🔹 Demo autofill
demoBtn?.addEventListener("click", () => {
  emailEl.value = "demo@example.com";
  passwordEl.value = "demo1234";
  showMessage("Demo credentials filled. Click Sign in to continue.", "success");
});

// 🔹 Friendly Firebase Auth error messages
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

// 🔹 Sign in and redirect
async function signInWithFirebase(email, password, remember) {
  try {
    // Persistence setting based on "remember me"
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Save user details in localStorage for home.html to read
    localStorage.setItem(
      "userDetails",
      JSON.stringify({
        email: user.email,
        uid: user.uid,
        tags: ["family", "heritage", "legacy"] // Example tags (can replace later from Firestore)
      })
    );

    showMessage("Welcome back! Redirecting...", "success", false);

    // ✅ Redirect to home.html
    setTimeout(() => {
      window.location.href = "./home/home.html";
    }, 1000);
  } catch (err) {
    const code = err.code || err?.message || "unknown";
    showMessage(friendlyErrorMessage(code));
    console.error("Firebase sign-in error:", err);
  }
}

// 🔹 Handle login form submit
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (emailEl.value || "").trim();
  const password = passwordEl.value || "";
  const remember = rememberCheckbox?.checked || false;

  // Client-side validation
  if (!email || !email.includes("@")) {
    showMessage("Please enter a valid email address.");
    return;
  }
  if (!password || password.length < 6) {
    showMessage("Password must be at least 6 characters.");
    return;
  }

  const controls = form.querySelectorAll("input, button, a");
  controls.forEach((c) => (c.disabled = true));

  try {
    await signInWithFirebase(email, password, remember);
  } finally {
    controls.forEach((c) => (c.disabled = false));
  }
});

// 🔹 Optional: Check auth state on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    console.log("No user signed in.");
  }
});
