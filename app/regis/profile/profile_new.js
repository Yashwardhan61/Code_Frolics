/* ===== Firebase Setup ===== */
// Using Firebase from the global namespace (initialized in HTML)

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ===== Global Variables ===== */
let currentUser = null;
let userProfile = {};
let userMedia = [];
let activeFilter = 'all';

/* ===== DOM Elements ===== */
// These variables will be initialized after DOM is loaded
let profileImage;
let usernameDisplay;
let nameDisplay;
let emailDisplay;
let descDisplay;
let storiesCount;
let memoriesCount;
let membersCount;
let mediaGrid;
let noMedia;
let activityFeed;
let noActivity;
let totalMediaCount;
let recentMediaDate;

// UI control elements
let menuIcon;
let dropdownMenu;
let overlay;
let loadingIndicator;
let errorMessage;
let notification;
let logoutBtn;
let addIcon;
let editBtn;
let profilePicture;

// Popups
let popupEdit;

// Edit profile form elements
let usernameInput;
let nameInput;
let descInput;
let usernameError;
let descError;
let saveProfileBtn;
let cancelEditBtn;

// Media preview elements
let previewOverlay;
let closePreview;
let previewContentContainer;

// Initialize DOM elements after page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // Initialize all DOM elements
    initializeDOMElements();
    
    // Set up event listeners
    setupEventListeners();
    
    /* ===== Auth State Observer ===== */
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserProfile();
            loadUserMedia();
            loadUserActivity();
        } else {
            // Redirect to login if not authenticated
            window.location.href = '../login.html';
        }
    });
});

// Initialize all DOM elements
function initializeDOMElements() {
    console.log('Initializing DOM elements');
    
    // Main elements
    profileImage = document.getElementById('profileImage');
    profilePicture = document.getElementById('profileImage'); // Alias for consistency with other code
    usernameDisplay = document.getElementById('usernameDisplay');
    nameDisplay = document.getElementById('nameDisplay');
    emailDisplay = document.getElementById('emailDisplay');
    descDisplay = document.getElementById('descDisplay');
    storiesCount = document.getElementById('storiesCount');
    memoriesCount = document.getElementById('memoriesCount');
    membersCount = document.getElementById('membersCount');
    mediaGrid = document.getElementById('mediaGrid');
    noMedia = document.getElementById('noMedia');
    activityFeed = document.getElementById('activityFeed');
    noActivity = document.getElementById('noActivity');
    totalMediaCount = document.getElementById('totalMediaCount');
    recentMediaDate = document.getElementById('recentMediaDate');

    // UI control elements
    menuIcon = document.getElementById('menuIcon');
    dropdownMenu = document.getElementById('dropdownMenu');
    overlay = document.getElementById('overlay');
    loadingIndicator = document.getElementById('loadingIndicator');
    errorMessage = document.getElementById('errorMessage');
    notification = document.getElementById('notification');
    logoutBtn = document.getElementById('logoutBtn');
    addIcon = document.getElementById('addIcon');
    editBtn = document.getElementById('editBtn');
    
    // Popups
    popupEdit = document.getElementById('popupEdit');
    
    // Edit profile form elements
    usernameInput = document.getElementById('usernameInput');
    nameInput = document.getElementById('nameInput');
    descInput = document.getElementById('descInput');
    usernameError = document.getElementById('usernameError');
    descError = document.getElementById('descError');
    saveProfileBtn = document.getElementById('saveProfileBtn');
    cancelEditBtn = document.getElementById('cancelEditBtn');
    
    // Media preview elements
    previewOverlay = document.getElementById('previewOverlay');
    closePreview = document.getElementById('closePreview');
    previewContentContainer = document.getElementById('previewContentContainer');
    
    // Log key elements to verify
    console.log('Add icon element:', addIcon);
}

/* ===== Profile Functions ===== */
// Load user profile from Firebase
async function loadUserProfile() {
    showLoading(true);
    try {
        const userId = currentUser.uid;
        const snapshot = await db.ref(`users/${userId}/profile`).once('value');
        const userData = snapshot.val() || {};
        
        // Default values if profile is incomplete
        userProfile = {
            username: userData.username || 'user_' + userId.substring(0, 6),
            name: userData.name || 'New User',
            email: currentUser.email,
            description: userData.description || 'No description yet.',
            photoURL: userData.photoURL || currentUser.photoURL || 'https://via.placeholder.com/150',
            stats: userData.stats || { stories: 0, memories: 0, members: 0 },
            hasChangedUsername: userData.hasChangedUsername || false
        };
        
        // Update UI with profile data
        updateProfileUI();
        
        // Initialize stats counts
        updateStats();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

// Update profile UI elements with current data
function updateProfileUI() {
    profileImage.src = userProfile.photoURL;
    usernameDisplay.innerText = '@' + userProfile.username;
    nameDisplay.innerText = userProfile.name;
    emailDisplay.innerText = userProfile.email;
    descDisplay.innerText = userProfile.description || 'Write something about yourself...';
}

// Save profile changes to Firebase
async function saveProfileChanges() {
    showLoading(true);
    
    // If username has been changed before, use the existing username
    const username = userProfile.hasChangedUsername ? 
        userProfile.username : usernameInput.value.trim();
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    
    // Validate inputs
    usernameError.innerText = '';
    descError.innerText = '';
    let hasError = false;
    
    // Only validate username if it hasn't been changed before
    if (!userProfile.hasChangedUsername) {
        const usernamePattern = /^[A-Za-z0-9_]+$/;
        if (!usernamePattern.test(username) || username === "") {
            usernameError.innerText = "Username must contain only letters, numbers, and underscores";
            hasError = true;
        }
    }
    
    const wordCount = description.split(/\s+/).filter(Boolean).length;
    if (wordCount > 50) {
        descError.innerText = `Description has ${wordCount} words (maximum: 50)`;
        hasError = true;
    }
    
    if (hasError) {
        showLoading(false);
        return;
    }
    
    try {
        // Check if username is already taken (except by current user)
        if (!userProfile.hasChangedUsername && username !== userProfile.username) {
            const usernameSnapshot = await db.ref('usernames').orderByValue()
                .equalTo(username).once('value');
            
            if (usernameSnapshot.exists()) {
                usernameError.innerText = "This username is already taken";
                showLoading(false);
                return;
            }
        }
        
        // Update profile data
        const userId = currentUser.uid;
        const updates = {
            [`users/${userId}/profile/name`]: name || 'New User',
            [`users/${userId}/profile/description`]: description
        };
        
        // Update username and set hasChangedUsername flag if this is the first change
        if (!userProfile.hasChangedUsername && username !== userProfile.username) {
            updates[`users/${userId}/profile/username`] = username;
            updates[`users/${userId}/profile/hasChangedUsername`] = true;
            updates[`usernames/${userId}`] = username;
            
            // Update local flag
            userProfile.hasChangedUsername = true;
            
            // Show notification about username change
            showNotification('Username updated! Note: You can only change it once.');
        }
        
        // Commit updates
        await db.ref().update(updates);
        
        // Update local data
        if (!userProfile.hasChangedUsername) {
            userProfile.username = username;
        }
        userProfile.name = name || 'New User';
        userProfile.description = description;
        
        // Update UI
        updateProfileUI();
        
        // Add activity
        addActivity('profile_update', 'Updated profile information');
        
        // Show success notification if not changing username
        if (userProfile.hasChangedUsername) {
            showNotification('Profile updated successfully!');
        }
        
        // Close popup
        closeAllPopups();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile changes. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Update profile picture
async function updateProfilePicture(file) {
    if (!file) return;
    
    // Create upload progress element
    const progressElement = document.createElement('div');
    progressElement.className = 'upload-progress';
    progressElement.innerHTML = `
        <div class="upload-progress-container">
            <div class="upload-progress-header">
                <span>Uploading profile picture...</span>
                <div class="upload-percent">0%</div>
            </div>
            <div class="upload-progress-bar">
                <div class="upload-progress-fill"></div>
            </div>
        </div>
    `;
    document.body.appendChild(progressElement);
    
    const progressFill = progressElement.querySelector('.upload-progress-fill');
    const progressPercent = progressElement.querySelector('.upload-percent');
    
    try {
        // Validate file type
        if (!file.type.match('image.*')) {
            throw new Error('Please select an image file (JPG, PNG, GIF)');
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size should be less than 5MB');
        }
        
        const userId = currentUser.uid;
        const userEmail = currentUser.email;
        const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `profile_${Date.now()}.${fileExt}`;
        // Use email-based path instead of UID for better permissions management
        const storageRef = storage.ref(`users/${safeEmail}/profile/${fileName}`);
        
        // Upload file to Firebase Storage with progress tracking
        const uploadTask = storageRef.put(file);
        
        // Track upload progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progressFill.style.width = progress + '%';
                progressPercent.textContent = progress + '%';
            },
            (error) => {
                throw error;
            }
        );
        
        // Wait for upload completion
        await uploadTask;
        
        // Get download URL
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        
        // Update profile using email-based path as the primary identifier
        // Keep the UID-based path updated as well for backward compatibility
        const updates = {
            [`users/${safeEmail}/profile/photoURL`]: downloadURL,
        };
        
        // Only update the UID path if it already exists
        try {
            const uidBasedProfile = await db.ref(`users/${userId}/profile`).once('value');
            if (uidBasedProfile.exists()) {
                updates[`users/${userId}/profile/photoURL`] = downloadURL;
            }
        } catch (err) {
            console.log('UID-based profile does not exist, skipping update');
        }
        
        await db.ref().update(updates);
        
        // Also update Firebase Auth user profile
        await currentUser.updateProfile({ photoURL: downloadURL });
        
        // Update local data and UI
        userProfile.photoURL = downloadURL;
        profileImage.src = downloadURL;
        
        // Add activity
        addActivity('profile_picture', 'Updated profile picture');
        
        // Show success in progress element
        progressElement.innerHTML = `
            <div class="upload-success">
                <i class="fas fa-check-circle"></i>
                <span>Profile picture updated successfully!</span>
            </div>
        `;
        
        // Show success notification
        showNotification('Profile picture updated!');
        
        // Remove progress element after delay
        setTimeout(() => {
            progressElement.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error updating profile picture:', error);
        
        // Show error in progress element
        progressElement.innerHTML = `
            <div class="upload-error">
                <i class="fas fa-times-circle"></i>
                <span>${error.message || 'Failed to update profile picture. Please try again.'}</span>
            </div>
        `;
        
        // Remove progress element after delay
        setTimeout(() => {
            progressElement.remove();
        }, 4000);
        
        showError(error.message || 'Failed to update profile picture. Please try again.');
    }
}

/* ===== Event Listeners ===== */
// Set up all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Navbar dropdown toggle
    menuIcon.addEventListener('click', () => {
        const isOpen = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isOpen ? 'none' : 'block';
        menuIcon.classList.toggle('active');
    });
    
    // Logout button
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = '../login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            showError('Failed to sign out. Please try again.');
        }
    });
    
    // Profile picture update
    addIcon.addEventListener('click', () => {
        console.log('Camera icon clicked!');
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = (e) => {
            console.log('File selected:', e.target.files);
            const file = e.target.files[0];
            if (file) {
                console.log('Processing file:', file.name, file.type, file.size);
                
                // Use the shared utility if available, otherwise fall back to local function
                if (window.UserProfileUtil) {
                    console.log('UserProfileUtil found, using shared utility');
                    
                    // Show loading indicator
                    showLoading(true);
                    
                    // Create upload progress element
                    const progressElement = document.createElement('div');
                    progressElement.className = 'upload-progress';
                    progressElement.innerHTML = `
                        <div class="upload-progress-container">
                            <div class="upload-progress-header">
                                <span>Uploading profile picture...</span>
                                <div class="upload-percent">0%</div>
                            </div>
                            <div class="upload-progress-bar">
                                <div class="upload-progress-fill"></div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(progressElement);
                    
                    const progressFill = progressElement.querySelector('.upload-progress-fill');
                    const progressPercent = progressElement.querySelector('.upload-percent');
                    
                    // Use shared utility with progress callback
                    window.UserProfileUtil.updateProfilePicture(file, 
                        (progress) => {
                            progressFill.style.width = progress + '%';
                            progressPercent.textContent = progress + '%';
                        })
                        .then(() => {
                            // Show success
                            progressElement.innerHTML = `
                                <div class="upload-success">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Profile picture updated successfully!</span>
                                </div>
                            `;
                            
                            // Add activity
                            addActivity('profile_picture', 'Updated profile picture');
                            
                            // Show success notification
                            showNotification('Profile picture updated!');
                            
                            // Remove progress element after delay
                            setTimeout(() => {
                                progressElement.remove();
                            }, 3000);
                        })
                        .catch((error) => {
                            // Show error
                            progressElement.innerHTML = `
                                <div class="upload-error">
                                    <i class="fas fa-times-circle"></i>
                                    <span>${error.message || 'Failed to update profile picture. Please try again.'}</span>
                                </div>
                            `;
                            
                            // Remove progress element after delay
                            setTimeout(() => {
                                progressElement.remove();
                            }, 4000);
                            
                            showError(error.message || 'Failed to update profile picture. Please try again.');
                        })
                        .finally(() => {
                            showLoading(false);
                        });
                } else {
                    // Fall back to local function
                    console.log('UserProfileUtil not found, using local function');
                    updateProfilePicture(file);
                }
            }
        };
        
        fileInput.click();
    });
    
    // Edit profile button
    editBtn.addEventListener('click', () => {
        // Populate form with current profile data
        usernameInput.value = userProfile.username;
        nameInput.value = userProfile.name;
        descInput.value = userProfile.description;
        
        // Disable username field if it's been changed before
        if (userProfile.hasChangedUsername) {
            usernameInput.disabled = true;
            usernameInput.classList.add('disabled');
            document.getElementById('usernameNote').style.display = 'block';
        } else {
            usernameInput.disabled = false;
            usernameInput.classList.remove('disabled');
            document.getElementById('usernameNote').style.display = 'none';
        }
        
        showPopup(popupEdit);
    });
    
    // Cancel edit button
    cancelEditBtn.addEventListener('click', closeAllPopups);
    
    // Save profile button
    saveProfileBtn.addEventListener('click', saveProfileChanges);
    
    // Close preview
    closePreview.addEventListener('click', () => {
        previewOverlay.style.display = 'none';
        previewContentContainer.innerHTML = '';
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Get filter type
            activeFilter = button.dataset.type;
            
            // Display filtered media
            displayMedia(activeFilter);
        });
    });
    
    // Click outside dropdown to close
    document.addEventListener('click', event => {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
            menuIcon.classList.remove('active');
        }
    });
}

/* ===== Media Functions ===== */
// Load user media from Stories in Firebase
async function loadUserMedia() {
    showLoading(true);
    try {
        const userId = currentUser.uid;
        const userEmail = currentUser.email;
        const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
        const storiesRef = db.ref(`users/${safeEmail}/stories`);
        
        // Listen for changes to user stories
        storiesRef.off(); // Remove any existing listeners
        storiesRef.on('value', snapshot => {
            const storiesData = snapshot.val() || {};
            
            // Initialize media array
            let mediaItems = [];
            
            // Process each story to extract media
            Object.entries(storiesData).forEach(([storyId, story]) => {
                // Skip stories without media
                if (!story.mediaUrls || story.mediaUrls.length === 0) return;
                
                // Convert to arrays if needed
                const mediaUrls = Array.isArray(story.mediaUrls) 
                    ? story.mediaUrls 
                    : Object.values(story.mediaUrls).filter(Boolean);
                    
                const mediaTypes = Array.isArray(story.mediaTypes) 
                    ? story.mediaTypes 
                    : Object.values(story.mediaTypes).filter(Boolean);
                
                // Create media items for each URL
                mediaUrls.forEach((url, index) => {
                    if (!url) return; // Skip empty URLs
                    
                    // Determine media type
                    let type = 'photo'; // Default
                    const mediaType = mediaTypes[index] || '';
                    
                    if (mediaType.startsWith('video/')) {
                        type = 'video';
                    } else if (mediaType.startsWith('audio/')) {
                        type = 'audio';
                    } else if (mediaType === 'text/plain') {
                        type = 'text';
                    }
                    
                    mediaItems.push({
                        id: `${storyId}_${index}`,
                        url: url,
                        type: type,
                        title: story.title || 'Untitled Story',
                        timestamp: story.createdAt || Date.now(),
                        storyId: storyId,
                        content: story.description || ''
                    });
                });
            });
            
            // Sort by timestamp (newest first)
            userMedia = mediaItems.sort((a, b) => b.timestamp - a.timestamp);
            
            // Update media grid
            displayMedia(activeFilter);
            
            // Update media stats
            updateMediaStats();
            
            // Update UI counters
            updateMediaCounters();
        });
        
        // Also check for shared stories with media
        const sharedStoriesRef = db.ref(`shared_stories/${safeEmail}`);
        sharedStoriesRef.off();
        sharedStoriesRef.on('value', snapshot => {
            const sharedData = snapshot.val() || {};
            let sharedMediaItems = [];
            
            // Process shared stories
            Object.entries(sharedData).forEach(([key, story]) => {
                // Skip stories without media
                if (!story.mediaUrls || story.mediaUrls.length === 0) return;
                
                // Convert to arrays if needed
                const mediaUrls = Array.isArray(story.mediaUrls) 
                    ? story.mediaUrls 
                    : Object.values(story.mediaUrls).filter(Boolean);
                    
                const mediaTypes = Array.isArray(story.mediaTypes) 
                    ? story.mediaTypes 
                    : Object.values(story.mediaTypes).filter(Boolean);
                
                // Create media items for each URL
                mediaUrls.forEach((url, index) => {
                    if (!url) return; // Skip empty URLs
                    
                    // Determine media type
                    let type = 'photo'; // Default
                    const mediaType = mediaTypes[index] || '';
                    
                    if (mediaType.startsWith('video/')) {
                        type = 'video';
                    } else if (mediaType.startsWith('audio/')) {
                        type = 'audio';
                    } else if (mediaType === 'text/plain') {
                        type = 'text';
                    }
                    
                    sharedMediaItems.push({
                        id: `shared_${key}_${index}`,
                        url: url,
                        type: type,
                        title: `${story.title || 'Untitled Story'} (Shared by ${story.owner})`,
                        timestamp: story.createdAt || Date.now(),
                        storyId: story.storyId,
                        content: story.description || ''
                    });
                });
            });
            
            // Combine with existing user media
            if (sharedMediaItems.length > 0) {
                // Merge and sort all media
                userMedia = [...userMedia, ...sharedMediaItems].sort((a, b) => b.timestamp - a.timestamp);
                
                // Update displays
                displayMedia(activeFilter);
                updateMediaStats();
                updateMediaCounters();
            }
        });
        
    } catch (error) {
        console.error('Error loading media:', error);
        showError('Failed to load media. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

// Display media in the grid based on filter
function displayMedia(filter) {
    // Clear current media grid
    mediaGrid.innerHTML = '';
    
    // Filter media by type
    const filteredMedia = filter === 'all' 
        ? userMedia 
        : userMedia.filter(item => item.type === filter);
    
    // Show empty state if no media
    if (filteredMedia.length === 0) {
        mediaGrid.innerHTML = '<div class="no-media">No media available in your collection</div>';
        return;
    }
    
    // Create media items
    filteredMedia.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.className = `media-item ${item.type}`;
        mediaItem.dataset.id = item.id;
        
        // Add story badge
        const isShared = item.id.startsWith('shared_');
        const storyBadge = isShared ? 
            '<div class="story-badge shared">Shared Story</div>' : 
            '<div class="story-badge">My Story</div>';
        
        switch (item.type) {
            case 'photo':
                mediaItem.innerHTML = `
                    ${storyBadge}
                    <img src="${item.url}" alt="${item.title || 'Photo'}">
                    <div class="media-info">
                        <div class="media-title">${item.title || 'Untitled photo'}</div>
                        <div class="media-date">${formatDate(item.timestamp)}</div>
                    </div>
                `;
                mediaItem.addEventListener('click', () => previewMedia(item));
                break;
                
            case 'video':
                mediaItem.innerHTML = `
                    ${storyBadge}
                    <div class="video-thumbnail">
                        <video src="${item.url}" preload="metadata"></video>
                        <div class="play-button"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="media-info">
                        <div class="media-title">${item.title || 'Untitled video'}</div>
                        <div class="media-date">${formatDate(item.timestamp)}</div>
                    </div>
                `;
                mediaItem.addEventListener('click', () => previewMedia(item));
                break;
                
            case 'audio':
                mediaItem.innerHTML = `
                    ${storyBadge}
                    <div class="audio-item">
                        <div class="audio-icon"><i class="fas fa-music"></i></div>
                        <audio src="${item.url}" controls preload="none"></audio>
                    </div>
                    <div class="media-info">
                        <div class="media-title">${item.title || 'Untitled audio'}</div>
                        <div class="media-date">${formatDate(item.timestamp)}</div>
                    </div>
                `;
                break;
                
            case 'text':
                mediaItem.innerHTML = `
                    ${storyBadge}
                    <div class="text-item">
                        <p>${item.content || 'No content'}</p>
                    </div>
                    <div class="media-info">
                        <div class="media-title">${item.title || 'Untitled note'}</div>
                        <div class="media-date">${formatDate(item.timestamp)}</div>
                    </div>
                `;
                mediaItem.addEventListener('click', () => previewMedia(item));
                break;
        }
        
        mediaGrid.appendChild(mediaItem);
    });
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

// Update media counters in the UI
function updateMediaCounters() {
    if (userMedia.length > 0) {
        totalMediaCount.textContent = userMedia.length;
        
        // Find most recent media
        const mostRecent = userMedia.reduce((latest, media) => 
            media.timestamp > latest.timestamp ? media : latest, userMedia[0]);
        
        recentMediaDate.textContent = formatDate(mostRecent.timestamp);
    } else {
        totalMediaCount.textContent = '0';
        recentMediaDate.textContent = '--';
    }
}

// Preview media in overlay
function previewMedia(media) {
    previewContentContainer.innerHTML = '';
    
    // Determine if this is a shared media item
    const isShared = media.id.startsWith('shared_');
    const storyLabel = isShared ? 'Shared Story' : 'My Story';
    const storyClass = isShared ? 'shared-story' : 'my-story';
    
    // Create story info header
    const storyInfo = `
        <div class="story-info ${storyClass}">
            <div class="story-badge">${storyLabel}</div>
            <h3>${media.title || 'Untitled Story'}</h3>
        </div>
    `;
    
    switch (media.type) {
        case 'photo':
            previewContentContainer.innerHTML = `
                ${storyInfo}
                <img class="preview-image" src="${media.url}" alt="${media.title || 'Photo'}">
            `;
            break;
            
        case 'video':
            previewContentContainer.innerHTML = `
                ${storyInfo}
                <video class="preview-video" src="${media.url}" controls autoplay></video>
            `;
            break;
            
        case 'text':
            previewContentContainer.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    ${storyInfo}
                    <h2 style="color: var(--brand-brown-700); margin-top: 0;">${media.title || 'Untitled Note'}</h2>
                    <p style="white-space: pre-wrap; line-height: 1.6;">${media.content || 'No content'}</p>
                </div>
            `;
            break;
            
        case 'audio':
            previewContentContainer.innerHTML = `
                ${storyInfo}
                <div class="audio-preview-container">
                    <div class="audio-icon-large"><i class="fas fa-music"></i></div>
                    <audio src="${media.url}" controls autoplay></audio>
                </div>
            `;
            break;
    }
    
    previewOverlay.style.display = 'flex';
}

/* ===== Activity Functions ===== */
// Load user activity from Firebase
async function loadUserActivity() {
    try {
        const userId = currentUser.uid;
        const activityRef = db.ref(`users/${userId}/activity`);
        
        // Listen for changes to user activity
        activityRef.off(); // Remove any existing listeners
        activityRef.orderByChild('timestamp')
            .limitToLast(10)
            .on('value', snapshot => {
                const activityData = snapshot.val() || {};
                
                // Convert object to array and sort by timestamp (newest first)
                const activities = Object.keys(activityData).map(key => ({
                    id: key,
                    ...activityData[key]
                })).sort((a, b) => b.timestamp - a.timestamp);
                
                // Update activity feed
                displayActivity(activities);
            });
        
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Display activities in the feed
function displayActivity(activities) {
    // Clear current activity feed
    activityFeed.innerHTML = '';
    
    // Show empty state if no activity
    if (activities.length === 0) {
        activityFeed.innerHTML = '<div class="no-activity">No recent activities to display</div>';
        return;
    }
    
    // Create activity items
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Determine icon based on activity type
        let icon;
        switch (activity.type) {
            case 'profile_update':
                icon = 'fa-user-edit';
                break;
            case 'profile_picture':
                icon = 'fa-camera';
                break;
            case 'photo_upload':
                icon = 'fa-image';
                break;
            case 'video_upload':
                icon = 'fa-video';
                break;
            case 'audio_upload':
                icon = 'fa-music';
                break;
            case 'text_create':
                icon = 'fa-align-left';
                break;
            default:
                icon = 'fa-circle';
        }
        
        // Format date
        const date = new Date(activity.timestamp);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${formattedDate}</div>
            </div>
        `;
        
        activityFeed.appendChild(activityItem);
    });
}

// Add new activity
async function addActivity(type, text) {
    try {
        const userId = currentUser.uid;
        const activityId = `activity_${Date.now()}`;
        const activityData = {
            type,
            text,
            timestamp: Date.now()
        };
        
        // Save activity to database
        await db.ref(`users/${userId}/activity/${activityId}`).set(activityData);
        
    } catch (error) {
        console.error('Error adding activity:', error);
    }
}

/* ===== Stats Functions ===== */
// Update user stats
async function updateStats() {
    try {
        const userId = currentUser.uid;
        
        // Get stories count
        const storiesSnapshot = await db.ref(`users/${userId}/stories`).once('value');
        const storiesData = storiesSnapshot.val() || {};
        const storiesCount = Object.keys(storiesData).length;
        
        // Get members count
        const membersSnapshot = await db.ref(`users/${userId}/members`).once('value');
        const membersData = membersSnapshot.val() || {};
        const membersCount = Object.keys(membersData).length;
        
        // Update stats in database
        await db.ref(`users/${userId}/profile/stats`).update({
            stories: storiesCount,
            members: membersCount
        });
        
        // Update UI
        document.getElementById('storiesCount').innerText = storiesCount;
        document.getElementById('membersCount').innerText = membersCount;
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update media stats
function updateMediaStats() {
    const mediaCount = userMedia.length;
    document.getElementById('memoriesCount').innerText = mediaCount;
    
    // Count media types
    const photoCount = userMedia.filter(item => item.type === 'photo').length;
    const videoCount = userMedia.filter(item => item.type === 'video').length;
    const audioCount = userMedia.filter(item => item.type === 'audio').length;
    const textCount = userMedia.filter(item => item.type === 'text').length;
    
    // Add type breakdown to tooltip if needed
    document.getElementById('memoriesCount').title = 
        `${photoCount} Photos, ${videoCount} Videos, ${audioCount} Audio, ${textCount} Texts`;
    
    // Update in database
    if (currentUser) {
        db.ref(`users/${currentUser.uid}/profile/stats/memories`).set({
            total: mediaCount,
            photos: photoCount,
            videos: videoCount,
            audio: audioCount,
            texts: textCount
        });
    }
}

/* ===== UI Helpers ===== */
// Show/hide loading indicator
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Show notification
function showNotification(message) {
    notification.innerText = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show success message (alias for showNotification)
function showSuccess(message) {
    showNotification(message);
}

// Show popup
function showPopup(popup) {
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

// Close all popups
function closeAllPopups() {
    overlay.style.display = 'none';
    popupEdit.style.display = 'none';
    
    // Clear form inputs
    usernameInput.value = '';
    nameInput.value = '';
    descInput.value = '';
    usernameError.innerText = '';
    descError.innerText = '';
}