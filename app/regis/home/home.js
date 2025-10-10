/* ===== Firebase Setup ===== */
// Using Firebase from the global namespace (initialized in HTML)
// This provides compatibility between the module version and the script version

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// For compatibility with existing code - mapping Firebase SDK v9 functions to v8 compatibility mode
const onAuthStateChanged = (auth, callback) => {
  return auth.onAuthStateChanged(callback);
};
const signOut = (auth) => {
  return auth.signOut();
};

// Database compatibility functions
const dbRef = (db, path) => {
  return db.ref(path);
};
const onValue = (ref, callback) => {
  return ref.on('value', callback);
};
const push = (ref) => {
  return ref.push();
};
const set = (ref, data) => {
  return ref.set(data);
};
const remove = (ref) => {
  return ref.remove();
};
const get = (ref) => {
  return ref.once('value');
};

// Storage compatibility functions
const storageRef = (storage, path) => {
  return storage.ref(path);
};
const uploadBytesResumable = (ref, data) => {
  return ref.put(data);
};
const getDownloadURL = (ref) => {
  return ref.getDownloadURL();
};
const deleteObject = (ref) => {
  return ref.delete();
};

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
  const notificationBadge = document.getElementById("notificationBadge");
  const friendInviteBadge = document.getElementById("friendInviteBadge");

  let storiesCache = [];

  /* === Story Menu Handlers === */
  let activeMenu = null;

  document.addEventListener('click', async (e) => {
    // Toggle menu
    if (e.target.classList.contains('story-menu-btn')) {
      e.stopPropagation();
      const storyId = e.target.dataset.storyId;
      const menuItems = document.getElementById(`menu-${storyId}`);
      
      if (activeMenu && activeMenu !== menuItems) {
        activeMenu.classList.remove('active');
      }
      
      menuItems.classList.toggle('active');
      activeMenu = menuItems;
      return;
    }

    // Handle menu item clicks
    if (e.target.classList.contains('story-menu-item')) {
      const action = e.target.dataset.action;
      const storyId = e.target.dataset.storyId;
      
      if (action === 'delete') {
        if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
          await deleteStory(storyId);
        }
      } else if (action === 'edit') {
        editStory(storyId);
      }
      
      // Close menu
      if (activeMenu) {
        activeMenu.classList.remove('active');
        activeMenu = null;
      }
      return;
    }

    // Close menu when clicking outside
    if (activeMenu) {
      activeMenu.classList.remove('active');
      activeMenu = null;
    }
  });

  /* === Toast & Notification Styles === */
  function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .toast,
      .upload-progress-container,
      .upload-error,
      .upload-success,
      .delete-status {
        position: fixed;
        bottom: 20px;
        right: 20px;
        min-width: 250px;
        max-width: 350px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        background: #fff;
        color: #333;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .toast.loading {
        background-color: #e7f3ff;
        border-left: 4px solid #1a73e8;
      }
      
      .toast.success,
      .upload-success {
        background-color: #e7f7ee;
        border-left: 4px solid #34a853;
      }
      
      .toast.warning {
        background-color: #fff8e1;
        border-left: 4px solid #fbbc04;
      }
      
      .toast.error,
      .upload-error {
        background-color: #fdedee;
        border-left: 4px solid #ea4335;
      }
      
      .upload-progress-container {
        background: white;
        width: 350px;
        padding: 12px;
      }
      
      .upload-progress-title {
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .upload-progress-bar {
        height: 6px;
        background: #eaeaea;
        border-radius: 3px;
        overflow: hidden;
        margin: 5px 0;
      }
      
      .upload-progress-fill {
        height: 100%;
        background: #1a73e8;
        width: 0;
        transition: width 0.2s ease;
      }
      
      .upload-progress-text {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .upload-error-icon,
      .upload-success-icon {
        margin-right: 12px;
        font-size: 20px;
      }
      
      .upload-success-icon {
        color: #34a853;
      }
      
      .upload-error-icon {
        color: #ea4335;
      }
      
      .upload-error-close,
      .upload-success-close {
        margin-left: auto;
        cursor: pointer;
        font-size: 18px;
        opacity: 0.7;
      }
      
      .upload-error-close:hover,
      .upload-success-close:hover {
        opacity: 1;
      }
      
      .transcribe-status {
        margin-top: 8px;
        padding: 8px;
        background-color: #e7f3ff;
        border-radius: 4px;
        font-size: 14px;
        color: #1a73e8;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Initialize styles
  addNotificationStyles();
  
  async function deleteStory(storyId) {
    try {
      // Check if user is logged in
      if (!auth.currentUser) {
        alert('Please log in to delete stories.');
        return;
      }

      const safeEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      
      // Get story data before deletion
      const storyRef = dbRef(db, `users/${safeEmail}/stories/${storyId}`);
      const storySnapshot = await get(storyRef);
      const storyData = storySnapshot.val();
      
      if (!storyData) {
        console.error('Story not found');
        alert('Story not found. It might have been already deleted.');
        return;
      }

      // Ensure arrays are properly initialized
      const mediaUrls = Array.isArray(storyData.mediaUrls) ? storyData.mediaUrls : [];
      const members = Array.isArray(storyData.members) ? storyData.members : [];

      // Show deletion status
      const statusElement = document.createElement('div');
      statusElement.className = 'delete-status';
      statusElement.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div style="margin-right: 10px;">
            <div class="spinner" style="border: 3px solid rgba(0, 0, 0, 0.1); border-top-color: #1a73e8; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
          </div>
          <div>
            <div style="font-weight: 500;">Deleting story</div>
            <div style="font-size: 12px; color: #666;" class="delete-status-text">Preparing...</div>
          </div>
        </div>
      `;
      document.body.appendChild(statusElement);
      
      const statusText = statusElement.querySelector('.delete-status-text');
      
      try {
        // Delete media files first
        if (mediaUrls.length > 0) {
          statusText.textContent = `Deleting media files (0/${mediaUrls.length})...`;
          let deletedCount = 0;
          
          for (const url of mediaUrls) {
            try {
              // Convert the full URL to storage path
              const urlObj = new URL(url);
              const storagePath = decodeURIComponent(urlObj.pathname.split('/o/')[1]);
              const fileRef = storageRef(storage, storagePath);
              await deleteObject(fileRef);
              
              deletedCount++;
              statusText.textContent = `Deleting media files (${deletedCount}/${mediaUrls.length})...`;
            } catch (err) {
              console.error('Error deleting media:', err, url);
              // Don't throw here, continue with other deletions
            }
          }
        }
        
        // Delete shared instances
        if (members.length > 0) {
          statusText.textContent = `Removing shared access (0/${members.length})...`;
          let removedCount = 0;
          
          for (const memberEmail of members) {
            try {
              const safeMemberEmail = memberEmail.replace(/\./g, "_").replace(/@/g, "_");
              const sharedRef = dbRef(db, `shared_stories/${safeMemberEmail}/${storyId}`);
              await remove(sharedRef);
              
              removedCount++;
              statusText.textContent = `Removing shared access (${removedCount}/${members.length})...`;
            } catch (err) {
              console.error('Error removing shared access:', err, memberEmail);
              // Don't throw here, continue with other deletions
            }
          }
        }
        
        // Finally, delete the story itself
        statusText.textContent = 'Deleting story data...';
        await remove(storyRef);
        
        // Show success message
        statusElement.innerHTML = `
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px; color: #34a853; font-size: 20px;">✓</div>
            <div>
              <div style="font-weight: 500;">Success</div>
              <div style="font-size: 12px; color: #666;">Story deleted successfully!</div>
            </div>
            <div style="margin-left: auto; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove()">×</div>
          </div>
        `;
        statusElement.style.background = '#e7f7ee';
        statusElement.style.borderLeft = '4px solid #34a853';
        setTimeout(() => statusElement.remove(), 3000);
      } catch (error) {
        console.error('Error during delete process:', error);
        statusElement.innerHTML = `
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px; color: #ea4335; font-size: 20px;">×</div>
            <div>
              <div style="font-weight: 500;">Error</div>
              <div style="font-size: 12px; color: #666;">Failed to delete story. Please try again.</div>
            </div>
            <div style="margin-left: auto; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove()">×</div>
          </div>
        `;
        statusElement.style.background = '#fdedee';
        statusElement.style.borderLeft = '4px solid #ea4335';
        setTimeout(() => statusElement.remove(), 5000);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      // Show error notification
      const errorElement = document.createElement('div');
      errorElement.className = 'delete-status';
      errorElement.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div style="margin-right: 10px; color: #ea4335; font-size: 20px;">×</div>
          <div>
            <div style="font-weight: 500;">Error</div>
            <div style="font-size: 12px; color: #666;">Failed to delete story. Please try again.</div>
          </div>
          <div style="margin-left: auto; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove()">×</div>
        </div>
      `;
      errorElement.style.background = '#fdedee';
      errorElement.style.borderLeft = '4px solid #ea4335';
      document.body.appendChild(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  function editStory(storyId) {
    const story = storiesCache.find(s => s.id === storyId);
    if (!story) return;

    // Populate form
    document.getElementById('storyTitle').value = story.title || '';
    document.getElementById('storyTags').value = story.tag || '';
    document.getElementById('storyLocation').value = story.location || '';
    document.getElementById('storyDate').value = story.date || '';
    document.getElementById('storyDescription').value = story.content || '';
    
    // Handle members through enhanced-tags.js
    const storyMembersInput = document.getElementById('storyMembers');
    if (storyMembersInput && story.members) {
      // Set the hidden input value with members
      storyMembersInput.value = Array.isArray(story.members) ? story.members.join(',') : '';
      
      // Reset and reinitialize the member input system
      const memberInputContainer = document.getElementById('memberInputContainer');
      if (memberInputContainer) {
        // Clear existing content
        memberInputContainer.innerHTML = '';
        
        // Re-initialize the member system with the updated values
        window.initMemberSystem();
      }
    }

    // Set form mode to edit
    addStoryForm.dataset.mode = 'edit';
    addStoryForm.dataset.editId = storyId;
    document.querySelector('.modal-content h2').textContent = 'Edit Story';
    document.getElementById('uploadBtn').textContent = 'Save Changes';
    
    // Show modal
    openModal();
  }

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
    console.log('Rendering stories:', list);
    storiesContainer.innerHTML = "";
    if (!list || list.length === 0) {
      console.log('No stories to render');
      storiesContainer.innerHTML = `<div class="no-stories">No stories yet. Click <strong>Add Story</strong> to add one.</div>`;
      return;
    }

    // Add animation to timeline track
    const timelineTrack = document.querySelector('.timeline-track');
    if (timelineTrack) {
      timelineTrack.style.animation = 'none';
      void timelineTrack.offsetWidth; // Force reflow
      timelineTrack.style.animation = 'timelineGrow 1.2s ease-out forwards';
    }

    list.sort((a, b) => b.createdAt - a.createdAt);
    console.log('Sorted stories:', list);

    list.forEach((s) => {
      const card = document.createElement("article");
      card.className = "story";

      let mediaHTML = "";
      if (s.mediaUrls && s.mediaUrls.length > 0) {
        // Ensure mediaUrls and mediaTypes are arrays and valid
        const mediaUrls = Array.isArray(s.mediaUrls) ? s.mediaUrls.filter(url => url) : [];
        const mediaTypes = Array.isArray(s.mediaTypes) ? s.mediaTypes.filter(type => type) : [];
        
        console.log('Story media:', { 
          id: s.id, 
          urls: mediaUrls, 
          types: mediaTypes,
          rawUrls: s.mediaUrls,
          rawTypes: s.mediaTypes
        }); // Debug log
        
        const mediaElements = mediaUrls.map((url, index) => {
          let type = mediaTypes[index] || "";
          const mediaId = `media-${s.id}-${index}`;
          
          // Skip if URL is null, undefined, or empty
          if (!url || typeof url !== 'string') {
            console.warn(`Invalid URL for media ${mediaId}:`, url);
            return "";
          }
          
          // Try to infer type from URL if missing
          if (!type) {
            if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
              type = 'image/jpeg';
            } else if (url.match(/\.(mp4|webm)$/i)) {
              type = 'video/mp4';
            } else if (url.match(/\.(mp3|wav)$/i)) {
              type = 'audio/mpeg';
            }
          }
          
          try {
            if (type.startsWith("image/")) {
              return `
                <div class="story-media-item" data-media-id="${mediaId}" data-media-type="image">
                  <img src="${url}" alt="Story image" data-url="${url}" loading="lazy">
                </div>
              `;
            } else if (type.startsWith("video/")) {
              return `
                <div class="story-media-item" data-media-id="${mediaId}" data-media-type="video">
                  <video src="${url}" data-url="${url}" preload="metadata" controls></video>
                </div>
              `;
            } else if (type.startsWith("audio/")) {
              return `
                <div class="story-media-item audio" data-media-id="${mediaId}" data-media-type="audio">
                  <span>🎵</span>
                  <audio controls src="${url}" data-url="${url}"></audio>
                </div>
              `;
            }
          } catch (err) {
            console.error(`Error creating media element for ${mediaId}:`, err);
          }
          return "";
        }).filter(el => el); // Remove empty elements
        
        if (mediaElements.length > 0) {
          const hasMoreMedia = mediaElements.length > 3;
          mediaHTML = `
            <div class="story-media">
              <div class="story-media-scroll">
                ${mediaElements.join("")}
              </div>
              ${hasMoreMedia ? '<button class="more-media" title="See more media">→</button>' : ''}
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="dot-wrap"><div class="dot"></div></div>
        <div class="content">
        <div class="story-header">
          <div class="story-title">
            <h3>${s.title || "Untitled"}</h3>
            <div class="meta">${s.members.length ? `Shared with ${s.members.length} members` : 'Private'} • ${s.location || ""} • ${s.date || ""}</div>
          </div>
          ${s.owner === auth.currentUser.email ? `
            <div class="story-menu">
              <button class="story-menu-btn" data-story-id="${s.id}">⋮</button>
              <div class="story-menu-items" id="menu-${s.id}">
                <div class="story-menu-item edit" data-action="edit" data-story-id="${s.id}">
                  <i>✎</i> Edit Story
                </div>
                <div class="story-menu-item delete" data-action="delete" data-story-id="${s.id}">
                  <i>🗑</i> Delete Story
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        <p>${s.content || ""}</p>
        ${mediaHTML}
      </div>
      `;
      storiesContainer.appendChild(card);
    });
  }

  /* === Firebase Realtime Listener === */
  async function checkUserExists(email) {
    const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
    const userRef = dbRef(db, `users/${safeEmail}`);
    const snapshot = await get(userRef);
    return snapshot.exists();
  }

  function startStoriesListener(userEmail) {
    console.log('Starting stories listener for:', userEmail);
    const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
    
    // Listen for user's own stories
    const ownStoriesRef = dbRef(db, `users/${safeEmail}/stories`);
    // Listen for stories shared with the user
    const sharedStoriesRef = dbRef(db, `shared_stories/${safeEmail}`);

    onValue(ownStoriesRef, (snapshot) => {
      console.log('Got stories update from Firebase');
      const data = snapshot.val();
      console.log('Raw stories data:', data);
      
      const arr = [];
      if (data) {
        Object.entries(data).forEach(([key, v]) => {
          console.log(`Processing story ${key}:`, v);
          
          // Properly handle media arrays
          let mediaUrls = [];
          let mediaTypes = [];
          
          // Handle both array and object formats from Firebase
          if (v.mediaUrls) {
            if (Array.isArray(v.mediaUrls)) {
              mediaUrls = v.mediaUrls.filter(url => url); // Remove null/undefined
            } else if (typeof v.mediaUrls === 'object') {
              mediaUrls = Object.values(v.mediaUrls).filter(url => url);
            }
          }
          
          if (v.mediaTypes) {
            if (Array.isArray(v.mediaTypes)) {
              mediaTypes = v.mediaTypes.filter(type => type); // Remove null/undefined
            } else if (typeof v.mediaTypes === 'object') {
              mediaTypes = Object.values(v.mediaTypes).filter(type => type);
            }
          }
          
          // Ensure mediaTypes array matches mediaUrls array length
          while (mediaTypes.length < mediaUrls.length) {
            // Try to infer type from URL if possible
            const url = mediaUrls[mediaTypes.length];
            if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) {
              mediaTypes.push('image/jpeg');
            } else if (url.includes('.mp4')) {
              mediaTypes.push('video/mp4');
            } else if (url.includes('.mp3') || url.includes('.wav')) {
              mediaTypes.push('audio/mpeg');
            } else {
              mediaTypes.push('application/octet-stream');
            }
          }

          const story = {
            id: key,
            title: v.title || "",
            content: v.description || "",
            members: Array.isArray(v.members) ? v.members : 
                    (typeof v.members === 'object' ? Object.values(v.members) : []),
            location: v.location || "",
            date: v.date || "",
            tag: v.tags || "",
            mediaUrls: mediaUrls,
            mediaTypes: mediaTypes,
            createdAt: v.createdAt || 0,
            owner: userEmail
          };
          console.log(`Processed story ${key}:`, story);
          arr.push(story);
        });
      }
      console.log('Processed stories array:', arr);
      storiesCache = arr;
      
      // Also fetch shared stories
      onValue(sharedStoriesRef, (sharedSnapshot) => {
        const sharedData = sharedSnapshot.val();
        if (sharedData) {
          Object.entries(sharedData).forEach(([key, v]) => {
            arr.push({
              id: v.storyId,
              title: v.title || "",
              content: v.description || "",
              members: v.members || [],
              location: v.location || "",
              date: v.date || "",
              tag: v.tags || "",
              mediaUrls: v.mediaUrls || [],
              mediaTypes: v.mediaTypes || [],
              createdAt: v.createdAt || 0,
              owner: v.owner
            });
          });
        }
        storiesCache = arr.sort((a, b) => b.createdAt - a.createdAt);
        renderStories(storiesCache);
      });
    });
  }

  /* === Media Preview & Upload Handlers === */
  const uploadZone = document.getElementById("uploadZone");
  const mediaPreview = document.getElementById("mediaPreview");
  let selectedFiles = new Set();

  function handleFileSelect(files) {
    if (!files.length) return;
    
    // Limit to 10 files
    if (selectedFiles.size + files.length > 10) {
      alert("Maximum 10 files allowed");
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.match(/^(image|video|audio)\//)) return;
      
      const reader = new FileReader();
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      
      reader.onload = (e) => {
        if (file.type.startsWith("image/")) {
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-btn" data-name="${file.name}">&times;</button>
          `;
        } else if (file.type.startsWith("video/")) {
          previewItem.innerHTML = `
            <video src="${e.target.result}"></video>
            <button class="remove-btn" data-name="${file.name}">&times;</button>
          `;
        } else if (file.type.startsWith("audio/")) {
          previewItem.className = "preview-item audio";
          previewItem.innerHTML = `
            <span>🎵</span>
            <button class="remove-btn" data-name="${file.name}">&times;</button>
          `;
        }
        
        mediaPreview.appendChild(previewItem);
      };
      
      reader.readAsDataURL(file);
      selectedFiles.add(file);
    });
  }

  // Drag and drop handlers
  uploadZone.addEventListener("dragenter", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });
  
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    handleFileSelect(e.dataTransfer.files);
  });

  // File input change handler
  document.getElementById("storyMedia").addEventListener("change", (e) => {
    handleFileSelect(e.target.files);
  });

  // Remove preview item handler
  mediaPreview.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const fileName = e.target.dataset.name;
      selectedFiles.forEach(file => {
        if (file.name === fileName) selectedFiles.delete(file);
      });
      e.target.parentElement.remove();
    }
  });

  /* === AI Transcribe Features === */
  const transcribeBtn = document.getElementById("transcribeBtn");
  const transcribeMenu = document.getElementById("transcribeMenu");
  let isTranscribing = false;

  // Toggle transcribe menu
  transcribeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    transcribeMenu.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", () => {
    transcribeMenu?.classList.remove("active");
  });

  // Handle transcribe options
  transcribeMenu?.addEventListener("click", async (e) => {
    const option = e.target.closest(".transcribe-option");
    if (!option) return;

    const action = option.dataset.action;
    transcribeMenu.classList.remove("active");
    
    if (isTranscribing) {
      alert("Please wait for the current transcription to complete.");
      return;
    }

    // Start loading state
    isTranscribing = true;
    transcribeBtn.classList.add("loading");
    const originalText = transcribeBtn.textContent;
    transcribeBtn.textContent = "Processing...";

    try {
      switch (action) {
        case "audio-to-text":
          await transcribeAudio();
          break;
        case "image-to-text":
          await extractTextFromImages();
          break;
        case "image-caption":
          await generateImageCaptions();
          break;
        case "auto-description":
          await generateAutoDescription();
          break;
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to process media. Please try again.");
    } finally {
      // Reset loading state
      isTranscribing = false;
      transcribeBtn.classList.remove("loading");
      transcribeBtn.innerHTML = '<i>🤖</i> ' + originalText;
    }
  });

  async function transcribeAudio() {
    const audioFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
      alert("Please add audio files to transcribe.");
      return;
    }

    const description = document.getElementById('storyDescription');
    let currentText = description.value;
    const loadingText = document.createElement('div');
    loadingText.className = 'transcribe-status';
    
    try {
      for (const [index, file] of audioFiles.entries()) {
        loadingText.textContent = `Transcribing ${file.name} (${index + 1}/${audioFiles.length})...`;
        description.parentNode.appendChild(loadingText);
        
        const transcription = await AIService.transcribeAudio(file);
        currentText += (currentText ? '\n\n' : '') + `Audio Transcription (${file.name}):\n${transcription}`;
        description.value = currentText;
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      loadingText.remove();
    }
  }

  async function extractTextFromImages() {
    const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Please add images to extract text from.");
      return;
    }

    const description = document.getElementById('storyDescription');
    let currentText = description.value;
    const loadingText = document.createElement('div');
    loadingText.className = 'transcribe-status';

    try {
      for (const [index, file] of imageFiles.entries()) {
        loadingText.textContent = `Analyzing image ${index + 1}/${imageFiles.length}...`;
        description.parentNode.appendChild(loadingText);

        // Convert file to URL for API
        const imageUrl = URL.createObjectURL(file);
        const analysis = await AIService.analyzeImage(imageUrl);
        
        currentText += (currentText ? '\n\n' : '') + `Image Analysis (${file.name}):\n${analysis}`;
        description.value = currentText;
        
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      alert('Failed to analyze images. Please try again.');
    } finally {
      loadingText.remove();
    }
  }

  async function generateImageCaptions() {
    const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Please add images to generate captions for.");
      return;
    }

    const description = document.getElementById('storyDescription');
    let currentText = description.value;
    const loadingText = document.createElement('div');
    loadingText.className = 'transcribe-status';

    try {
      for (const [index, file] of imageFiles.entries()) {
        loadingText.textContent = `Generating caption for image ${index + 1}/${imageFiles.length}...`;
        description.parentNode.appendChild(loadingText);

        const imageUrl = URL.createObjectURL(file);
        const analysis = await AIService.analyzeImage(imageUrl);
        
        // Extract the first sentence as caption
        const caption = analysis.split('.')[0] + '.';
        currentText += (currentText ? '\n\n' : '') + `Image Caption (${file.name}):\n${caption}`;
        description.value = currentText;
        
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Caption generation error:', error);
      alert('Failed to generate captions. Please try again.');
    } finally {
      loadingText.remove();
    }
  }

  async function generateAutoDescription() {
    if (selectedFiles.size === 0) {
      alert("Please add media files to generate a description.");
      return;
    }

    const description = document.getElementById('storyDescription');
    const loadingText = document.createElement('div');
    loadingText.className = 'transcribe-status';
    loadingText.textContent = 'Analyzing media and generating description...';
    description.parentNode.appendChild(loadingText);

    try {
      const mediaFiles = Array.from(selectedFiles);
      const mediaUrls = await Promise.all(
        mediaFiles.map(file => URL.createObjectURL(file))
      );
      const mediaTypes = mediaFiles.map(file => file.type);

      const generatedDescription = await AIService.generateDescription(mediaUrls, mediaTypes);
      description.value = generatedDescription;

      // Cleanup URLs
      mediaUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (error) {
      console.error('Description generation error:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      loadingText.remove();
    }
  }

  /* === Upload Helper === */
  async function uploadFile(file, storyKey) {
    // Sanitize file name to remove special characters
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${safeFileName}`;
    const path = `stories/${storyKey}/${fileName}`;
    const fileRef = storageRef(storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress updates if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress for ${fileName}: ${progress.toFixed(1)}%`);
        },
        (error) => {
          // Handle errors
          console.error(`Error uploading ${fileName}:`, error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL on completion
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url, type: file.type });
          } catch (err) {
            console.error(`Error getting download URL:`, err);
            reject(err);
          }
        }
      );
    });
  }

  /* === Member Management === */
  // Member management is now handled by enhanced-tags.js
  // This ensures consistent functionality across the application

  /* === Add Story Form === */
  addStoryForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please log in first.");

    const title = document.getElementById("storyTitle").value.trim();
    const tags = document.getElementById("storyTags").value.trim();
    const location = document.getElementById("storyLocation").value.trim();
    
    // Get members from the hidden input field populated by enhanced-tags.js
    const membersInput = document.getElementById("storyMembers");
    const members = membersInput && membersInput.value ? membersInput.value.split(',') : [];
    
    const date = document.getElementById("storyDate").value.trim();
    const description = document.getElementById("storyDescription").value.trim();

    const safeEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const newStoryRef = push(dbRef(db, `users/${safeEmail}/stories`));

    let mediaUrls = [], mediaTypes = [];
    if (selectedFiles.size > 0) {
      // Show upload progress
      const progressContainer = document.createElement('div');
      progressContainer.className = 'upload-progress-container';
      progressContainer.innerHTML = `
        <div class="upload-progress-title">Uploading media files...</div>
        <div class="upload-progress-bar">
          <div class="upload-progress-fill"></div>
        </div>
        <div class="upload-progress-text">Preparing files...</div>
      `;
      document.body.appendChild(progressContainer);
      
      const progressFill = progressContainer.querySelector('.upload-progress-fill');
      const progressText = progressContainer.querySelector('.upload-progress-text');

      try {
        const files = Array.from(selectedFiles);
        
        // Upload each file sequentially for better reliability
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const progress = Math.floor((i / files.length) * 100);
          
          progressFill.style.width = `${progress}%`;
          progressText.textContent = `Uploading file ${i + 1} of ${files.length}: ${file.name}`;
          
          try {
            const result = await uploadFile(file, newStoryRef.key);
            if (result && result.url) {
              mediaUrls.push(result.url);
              mediaTypes.push(result.type);
            }
          } catch (err) {
            console.error(`Failed to upload ${file.name}:`, err);
            // Continue with next file
          }
        }
        
        // Check if any files were uploaded successfully
        if (mediaUrls.length === 0) {
          progressContainer.innerHTML = `
            <div class="upload-error">
              <div class="upload-error-icon">❌</div>
              <div class="upload-error-text">Failed to upload media files</div>
              <div class="upload-error-close">×</div>
            </div>
          `;
          progressContainer.querySelector('.upload-error-close').onclick = () => progressContainer.remove();
          setTimeout(() => progressContainer.remove(), 5000);
          return;
        }
        
        // Show success
        progressContainer.innerHTML = `
          <div class="upload-success">
            <div class="upload-success-icon">✓</div>
            <div class="upload-success-text">
              ${mediaUrls.length} ${mediaUrls.length === 1 ? 'file' : 'files'} uploaded successfully
            </div>
            <div class="upload-success-close">×</div>
          </div>
        `;
        progressContainer.querySelector('.upload-success-close').onclick = () => progressContainer.remove();
        setTimeout(() => progressContainer.remove(), 3000);
      } catch (err) {
        console.error("Upload failed:", err);
        
        progressContainer.innerHTML = `
          <div class="upload-error">
            <div class="upload-error-icon">❌</div>
            <div class="upload-error-text">Failed to upload media files</div>
            <div class="upload-error-close">×</div>
          </div>
        `;
        progressContainer.querySelector('.upload-error-close').onclick = () => progressContainer.remove();
        setTimeout(() => progressContainer.remove(), 5000);
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
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],  // Ensure it's always an array
      mediaTypes: mediaTypes.length > 0 ? mediaTypes : [], // Ensure it's always an array
      createdAt: Date.now()
    };
    
    console.log('Saving story data:', storyData);
    console.log('Media URLs:', mediaUrls);
    console.log('Media Types:', mediaTypes);

    try {
      // Ensure arrays are properly set
      storyData.members = Array.isArray(storyData.members) ? storyData.members : [];
      storyData.mediaUrls = Array.isArray(storyData.mediaUrls) ? storyData.mediaUrls : [];
      storyData.mediaTypes = Array.isArray(storyData.mediaTypes) ? storyData.mediaTypes : [];
      
      // Save the story
      await set(newStoryRef, storyData);
      console.log('Story saved successfully');
      
      // Verify the save
      const savedData = await get(newStoryRef);
      console.log('Verified saved data:', savedData.val());
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }

    // Share with members
    if (members.length > 0) {
      const shares = members.map(memberEmail => {
        const safeMemberEmail = memberEmail.replace(/\./g, "_").replace(/@/g, "_");
        return set(dbRef(db, `shared_stories/${safeMemberEmail}/${newStoryRef.key}`), {
          ...storyData,
          storyId: newStoryRef.key,
          owner: auth.currentUser.email
        });
      });

      await Promise.all(shares);
    }

    // Reset form
    addStoryForm.reset();
    selectedFiles.clear();
    mediaPreview.innerHTML = "";
    
    // Reset member input by reinitializing it
    const memberInputContainer = document.getElementById('memberInputContainer');
    if (memberInputContainer) {
      memberInputContainer.innerHTML = '';
      window.initMemberSystem();
    }
    
    closeModalFn();
  });

  /* === Media Preview Handling === */
  const previewModal = document.getElementById("previewModal");
  const fullscreenView = document.getElementById("fullscreenView");
  const previewContainer = document.querySelector(".preview-container");
  const previewThumbnails = document.querySelector(".preview-thumbnails");
  const fullscreenContent = document.querySelector(".fullscreen-content");
  let currentMediaUrls = [];
  let currentIndex = 0;

  function openPreview(mediaItems, clickedIndex) {
    currentMediaUrls = Array.from(mediaItems).map(item => ({
      url: item.querySelector('img, video, audio').getAttribute('data-url'),
      type: item.getAttribute('data-media-type')
    }));
    currentIndex = clickedIndex;
    
    // Generate thumbnails
    previewThumbnails.innerHTML = currentMediaUrls.map((media, index) => {
      if (media.type === 'image') {
        return `
          <div class="preview-thumbnail ${index === clickedIndex ? 'active' : ''}" data-index="${index}">
            <img src="${media.url}" alt="Thumbnail">
          </div>
        `;
      } else if (media.type === 'video') {
        return `
          <div class="preview-thumbnail ${index === clickedIndex ? 'active' : ''}" data-index="${index}">
            <video src="${media.url}"></video>
          </div>
        `;
      } else {
        return `
          <div class="preview-thumbnail ${index === clickedIndex ? 'active' : ''}" data-index="${index}">
            <div class="audio-thumb">🎵</div>
          </div>
        `;
      }
    }).join('');

    showMedia(clickedIndex);
    previewModal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }

  function showMedia(index) {
    const media = currentMediaUrls[index];
    let content = '';
    
    if (media.type === 'image') {
      content = `<img src="${media.url}" alt="Preview" class="preview-media">`;
    } else if (media.type === 'video') {
      content = `<video src="${media.url}" controls class="preview-media"></video>`;
    } else if (media.type === 'audio') {
      content = `<div class="audio-preview"><span>🎵</span><audio src="${media.url}" controls></audio></div>`;
    }
    
    previewContainer.innerHTML = content;
    
    // Update fullscreen view content
    fullscreenContent.innerHTML = content;
    
    updateThumbnailStates(index);
  }

  function updateThumbnailStates(activeIndex) {
    document.querySelectorAll('.preview-thumbnail').forEach((thumb, index) => {
      thumb.classList.toggle('active', index === activeIndex);
    });
  }

  // Event Listeners
  document.addEventListener('click', (e) => {
    // Handle media item clicks
    if (e.target.closest('.story-media-item')) {
      const mediaItem = e.target.closest('.story-media-item');
      const mediaContainer = mediaItem.closest('.story-media');
      const allMediaItems = mediaContainer.querySelectorAll('.story-media-item');
      const clickedIndex = Array.from(allMediaItems).indexOf(mediaItem);
      openPreview(allMediaItems, clickedIndex);
    }

    // Handle thumbnail clicks
    if (e.target.closest('.preview-thumbnail')) {
      const thumb = e.target.closest('.preview-thumbnail');
      const index = parseInt(thumb.dataset.index);
      currentIndex = index;
      showMedia(index);
    }

    // Handle preview media clicks for fullscreen
    if (e.target.closest('.preview-media')) {
      fullscreenView.classList.remove('hidden');
      showMedia(currentIndex); // Refresh media in fullscreen
    }

    // Handle close buttons
    if (e.target.closest('.close-preview')) {
      previewModal.classList.add('hidden');
      document.body.classList.remove('no-scroll');
    }
    if (e.target.closest('.close-fullscreen')) {
      fullscreenView.classList.add('hidden');
    }

    // Handle navigation buttons
    if (e.target.closest('.prev-btn')) {
      currentIndex = (currentIndex - 1 + currentMediaUrls.length) % currentMediaUrls.length;
      showMedia(currentIndex);
    }
    if (e.target.closest('.next-btn')) {
      currentIndex = (currentIndex + 1) % currentMediaUrls.length;
      showMedia(currentIndex);
    }
  });

  // Handle media scroll
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('more-media')) {
      const mediaScroll = e.target.previousElementSibling;
      const scrollAmount = mediaScroll.offsetWidth;
      const maxScroll = mediaScroll.scrollWidth - mediaScroll.offsetWidth;
      const newScrollLeft = Math.min(mediaScroll.scrollLeft + scrollAmount, maxScroll);
      
      if (mediaScroll.scrollLeft >= maxScroll - 10) {
        // If we're at the end, scroll back to start
        mediaScroll.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        mediaScroll.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    }
  });

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (previewModal.classList.contains('hidden')) return;
    
    if (e.key === 'Escape') {
      if (!fullscreenView.classList.contains('hidden')) {
        fullscreenView.classList.add('hidden');
      } else {
        previewModal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
      }
    } else if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + currentMediaUrls.length) % currentMediaUrls.length;
      showMedia(currentIndex);
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % currentMediaUrls.length;
      showMedia(currentIndex);
    }
  });

  /* === Auth Handling === */
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    startStoriesListener(user.email);
    startNotificationsListener(user.email);
    startFriendInvitationsListener(user.email);

    logoutBtn?.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "../login.html";
    });
  });

  /* === Notification Handler === */
  function startNotificationsListener(userEmail) {
    const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
    const notificationsRef = dbRef(db, `users/${safeEmail}/notifications`);
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      let unreadCount = 0;
      
      if (data) {
        // Count unread notifications
        Object.values(data).forEach(notification => {
          if (!notification.read) {
            unreadCount++;
          }
        });
      }
      
      // Update notification badge
      if (notificationBadge) {
        if (unreadCount > 0) {
          notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          notificationBadge.classList.remove('hidden');
        } else {
          notificationBadge.classList.add('hidden');
        }
      }
    });
  }
  
  /* === Friend Invitation Handler === */
  function startFriendInvitationsListener(userEmail) {
    const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
    const invitationsRef = dbRef(db, `users/${safeEmail}/invitations`);
    
    onValue(invitationsRef, (snapshot) => {
      const data = snapshot.val();
      let invitationsCount = 0;
      
      if (data) {
        // Count invitations
        invitationsCount = Object.keys(data).length;
      }
      
      // Update friend invitation badge
      if (friendInviteBadge) {
        if (invitationsCount > 0) {
          friendInviteBadge.textContent = invitationsCount > 99 ? '99+' : invitationsCount;
          friendInviteBadge.classList.remove('hidden');
        } else {
          friendInviteBadge.classList.add('hidden');
        }
      }
    });
  }
});
