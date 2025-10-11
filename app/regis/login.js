import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// Forgot password elements
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetEmailEl = document.getElementById("resetEmail");
const resetMessageEl = document.getElementById("resetMessage");

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
    console.log("Beginning authentication process for:", email);
    
    // Persistence setting based on "remember me"
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    console.log("Persistence set:", remember ? "Local" : "Session");

    console.log("Attempting to sign in...");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    console.log("Authentication successful for:", user.email);

    // Save user details in localStorage for other pages to read
    localStorage.setItem(
      "userDetails",
      JSON.stringify({
        email: user.email,
        uid: user.uid,
        tags: ["family", "heritage", "legacy"] // Example tags (can replace later from Firestore)
      })
    );

    showMessage("Welcome back! Redirecting...", "success", false);

    // Check if user has completed profile setup
    // We'll convert email to safe format for database keys
    const safeEmail = user.email.replace(/\./g, "_").replace(/@/g, "_");
    const database = getDatabase(app);
    const userProfileRef = ref(database, `users/${safeEmail}/profile`);
    
    try {
      console.log("Checking user profile at:", `users/${safeEmail}/profile`);
      const snapshot = await get(userProfileRef);
      const profileData = snapshot.val();
      console.log("Profile data retrieved:", profileData);
      
      // Check if profile exists and has been set up
      if (!profileData || !profileData.profileSetupComplete) {
        console.log("First time login or profile not set up, redirecting to profile page");
        // First-time user or profile not set up, redirect to profile setup
        setTimeout(() => {
          window.location.href = "./profile/profile.html?setup=true";
        }, 1000);
      } else {
        // Returning user with profile already set up, redirect to home
        console.log("Profile already set up, redirecting to home page");
        setTimeout(() => {
          window.location.href = "./home/home.html";
        }, 1000);
      }
    } catch (dbErr) {
      console.error("Error checking profile:", dbErr);
      console.error("Database error code:", dbErr.code);
      console.error("Database error message:", dbErr.message);
      
      // Log additional context for debugging
      console.log("User info:", {
        email: user.email,
        safeEmail: safeEmail
      });
      
      // Default to home page if there's an error checking profile
      setTimeout(() => {
        window.location.href = "./home/home.html";
      }, 1000);
    }
    
  } catch (err) {
    const code = err.code || err?.message || "unknown";
    showMessage(friendlyErrorMessage(code));
    console.error("Firebase sign-in error:", err);
    console.error("Error code:", code);
    console.error("Error message:", err.message);
    
    // Log additional details for debugging
    if (err.customData) {
      console.error("Custom data:", err.customData);
    }
    
    // Check for common configuration issues
    if (code === "auth/invalid-api-key") {
      console.error("API key issue detected. Check your Firebase config.");
    }
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

// 🔹 Forgot password functionality
forgotPasswordLink?.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.classList.remove("hidden");
  resetEmailEl.value = emailEl.value || "";
  resetMessageEl.style.display = "none";
});

closeModalBtn?.addEventListener("click", () => {
  forgotPasswordModal.classList.add("hidden");
});

// Close modal if clicking outside content
forgotPasswordModal?.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) {
    forgotPasswordModal.classList.add("hidden");
  }
});

// Show message in reset form
function showResetMessage(text, type = "error") {
  resetMessageEl.style.display = "block";
  resetMessageEl.className = "message " + (type === "success" ? "success" : "error");
  resetMessageEl.textContent = text;
}

// Handle reset password form submission
resetPasswordForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (resetEmailEl.value || "").trim();

  // Client-side validation
  if (!email || !email.includes("@")) {
    showResetMessage("Please enter a valid email address.");
    return;
  }

  const submitBtn = resetPasswordForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    await sendPasswordResetEmail(auth, email);
    showResetMessage("Password reset email sent! Check your inbox.", "success");
    
    // Clear and close after 3 seconds on success
    setTimeout(() => {
      forgotPasswordModal.classList.add("hidden");
      resetEmailEl.value = "";
    }, 3000);
    
  } catch (err) {
    const code = err.code || "unknown";
    let errorMessage;
    
    switch (code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again later.";
        break;
      default:
        errorMessage = "Failed to send reset email. Please try again.";
    }
    
    showResetMessage(errorMessage);
    console.error("Firebase reset password error:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Reset Link";
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
