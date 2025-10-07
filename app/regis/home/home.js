/* ===== Firebase Modular SDK imports ===== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
  set
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

/* ===== Firebase Config ===== */
const firebaseConfig = {
  apiKey: "AIzaSyCIIbfmTiLcnbBIf2a1RDe4NtgWvQ16IgE",
  authDomain: "baksha-d6af1.firebaseapp.com",
  projectId: "baksha-d6af1",
  storageBucket: "baksha-d6af1.firebasestorage.app",
  messagingSenderId: "1000632616535",
  appId: "1:1000632616535:web:5841a1627a3e609988c512",
  databaseURL: "https://baksha-d6af1-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

/* ===== Main Page Script ===== */
window.addEventListener("DOMContentLoaded", () => {
  /* === Elements === */
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const addStoryBtn = document.getElementById("addStoryBtn");
  const addStoryModal = document.getElementById("addStoryModal");
  const closeModal = document.getElementById("closeModal");
  const addStoryForm = document.getElementById("addStoryForm");
  const uploadBtn = document.getElementById("uploadBtn");
  const storiesContainer = document.getElementById("storiesContainer");
  const logoutBtn = document.getElementById("logoutBtn");

  let storiesCache = [];

  /* === Sidebar Toggle === */
  function openSidebar() {
    sideMenu.classList.add("active");
    menuOverlay.classList.add("active");
    sideMenu.setAttribute("aria-hidden", "false");
  }
  function closeSidebar() {
    sideMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    sideMenu.setAttribute("aria-hidden", "true");
  }

  menuToggle?.addEventListener("click", () => {
    if (sideMenu.classList.contains("active")) closeSidebar();
    else openSidebar();
  });
  menuOverlay?.addEventListener("click", closeSidebar);

  /* === Modal Toggle === */
  function openModal() {
    addStoryModal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  }
  function closeModalFn() {
    addStoryModal.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }

  addStoryBtn?.addEventListener("click", openModal);
  closeModal?.addEventListener("click", closeModalFn);
  addStoryModal?.addEventListener("click", (ev) => {
    if (ev.target === addStoryModal) closeModalFn();
  });

  /* === Render Stories === */
  function renderStories(list) {
    storiesContainer.innerHTML = "";
    if (!list || list.length === 0) {
      storiesContainer.innerHTML = `<div class="no-stories">No stories yet. Click <strong>Add Story</strong> to add one.</div>`;
      return;
    }

    list.sort((a, b) => b.createdAt - a.createdAt);

    list.forEach((s) => {
      const card = document.createElement("article");
      card.className = "story";

      let mediaHTML = "";
      if (s.mediaUrl) {
        const type = s.mediaType || "";
        if (type.startsWith("image/")) {
          mediaHTML = `<div class="story-media"><img src="${s.mediaUrl}" alt="Story image"></div>`;
        } else if (type.startsWith("video/")) {
          mediaHTML = `<div class="story-media"><video controls src="${s.mediaUrl}"></video></div>`;
        } else if (type.startsWith("audio/")) {
          mediaHTML = `<div class="story-media"><audio controls src="${s.mediaUrl}"></audio></div>`;
        }
      }

      card.innerHTML = `
        <div class="dot-wrap"><div class="dot"></div></div>
        <div class="content">
          <h3>${s.title || "Untitled"}</h3>
          <div class="meta">${s.members || ""} • ${s.location || ""} • ${s.date || ""}</div>
          <p>${s.content || ""}</p>
          ${mediaHTML}
        </div>
      `;
      storiesContainer.appendChild(card);
    });
  }

  /* === Firebase Realtime Listener === */
  function startStoriesListener(userEmail) {
    const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
    const ref = dbRef(db, `users/${safeEmail}/stories`);

    onValue(ref, (snapshot) => {
      const data = snapshot.val();
      const arr = [];
      if (data) {
        Object.entries(data).forEach(([key, v]) => {
          arr.push({
            id: key,
            title: v.title || "",
            content: v.description || "",
            members: v.members || "",
            location: v.location || "",
            date: v.date || "",
            tag: v.tags || "",
            mediaUrl: v.mediaUrl || "",
            mediaType: v.mediaType || "",
            createdAt: v.createdAt || 0
          });
        });
      }
      storiesCache = arr;
      renderStories(storiesCache);
    });
  }

  /* === Upload Helper === */
  async function uploadFile(file, storyKey) {
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, `stories/${storyKey}/${fileName}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, type: file.type });
        }
      );
    });
  }

  /* === Add Story Form === */
  addStoryForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please log in first.");

    const title = document.getElementById("storyTitle").value.trim();
    const tags = document.getElementById("storyTags").value.trim();
    const location = document.getElementById("storyLocation").value.trim();
    const members = document.getElementById("storyMembers").value.trim();
    const date = document.getElementById("storyDate").value.trim();
    const description = document.getElementById("storyDescription").value.trim();
    const file = document.getElementById("storyMedia").files[0];

    const safeEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const newStoryRef = push(dbRef(db, `users/${safeEmail}/stories`));

    let mediaUrl = "", mediaType = "";
    if (file) {
      try {
        const uploadRes = await uploadFile(file, newStoryRef.key);
        mediaUrl = uploadRes.url;
        mediaType = uploadRes.type;
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload media.");
        return;
      }
    }

    const storyData = {
      title,
      tags,
      location,
      members,
      date,
      description,
      mediaUrl,
      mediaType,
      createdAt: Date.now()
    };

    await set(newStoryRef, storyData);
    addStoryForm.reset();
    closeModalFn();
  });

  /* === Auth Handling === */
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    startStoriesListener(user.email);

    logoutBtn?.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "../login.html";
    });
  });
});
