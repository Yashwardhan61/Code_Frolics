/**
 * User Profile Utility
 * This utility provides functions to manage and retrieve user profile data across the application.
 */

const UserProfileUtil = (function() {
    // Firebase references
    let auth;
    let db;
    let storage;
    
    // Cache for user profile data
    let cachedProfile = null;
    let profileObservers = [];
    
    /**
     * Initialize the utility with Firebase instances
     * @param {Object} firebaseAuth - Firebase Auth instance
     * @param {Object} firebaseDb - Firebase Database instance
     * @param {Object} firebaseStorage - Firebase Storage instance
     */
    function init(firebaseAuth, firebaseDb, firebaseStorage) {
        auth = firebaseAuth;
        db = firebaseDb;
        storage = firebaseStorage;
        
        // Set up auth state listener
        auth.onAuthStateChanged(user => {
            if (user) {
                loadUserProfile(user);
            } else {
                cachedProfile = null;
                notifyObservers();
            }
        });
    }
    
    /**
     * Load user profile data from Firebase
     * @param {Object} user - Firebase Auth user object
     */
    async function loadUserProfile(user) {
        try {
            const userId = user.uid;
            const userEmail = user.email;
            const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
            
            // First try to get profile from email-based path
            const snapshot = await db.ref(`users/${safeEmail}/profile`).once('value');
            const userData = snapshot.val() || {};
            
            // Default values if profile is incomplete
            cachedProfile = {
                userId: userId,
                email: user.email,
                username: userData.username || 'user_' + userId.substring(0, 6),
                name: userData.name || 'New User',
                description: userData.description || '',
                photoURL: userData.photoURL || user.photoURL || 'https://via.placeholder.com/150',
                hasChangedUsername: userData.hasChangedUsername || false
            };
            
            // Notify all observers
            notifyObservers();
            
            // Set up real-time listener for profile updates using email-based path
            db.ref(`users/${safeEmail}/profile`).on('value', snapshot => {
                const updatedData = snapshot.val() || {};
                
                if (updatedData) {
                    cachedProfile = {
                        ...cachedProfile,
                        username: updatedData.username || cachedProfile.username,
                        name: updatedData.name || cachedProfile.name,
                        description: updatedData.description || cachedProfile.description,
                        photoURL: updatedData.photoURL || cachedProfile.photoURL,
                        hasChangedUsername: updatedData.hasChangedUsername || cachedProfile.hasChangedUsername
                    };
                    
                    notifyObservers();
                }
            });
            
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    /**
     * Update user profile picture
     * @param {File} file - Image file to upload
     * @param {Function} progressCallback - Optional callback for upload progress updates
     * @returns {Promise<string>} - Download URL of the uploaded image
     */
    async function updateProfilePicture(file, progressCallback = null) {
        if (!file || !auth.currentUser) {
            throw new Error('No file selected or user not authenticated');
        }
        
        try {
            // Validate file type
            if (!file.type.match('image.*')) {
                throw new Error('Please select an image file (JPG, PNG, GIF)');
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image size should be less than 5MB');
            }
            
            const userId = auth.currentUser.uid;
            const userEmail = auth.currentUser.email;
            const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `profile_${Date.now()}.${fileExt}`;
            // Use email-based path instead of UID for better permissions management
            const storageRef = storage.ref(`users/${safeEmail}/profile/${fileName}`);
            
            // Upload file to Firebase Storage with progress tracking
            const uploadTask = storageRef.put(file);
            
            // Track upload progress
            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (typeof progressCallback === 'function') {
                    progressCallback(progress);
                }
            });
            
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
            await auth.currentUser.updateProfile({ photoURL: downloadURL });
            
            // Update local cache
            if (cachedProfile) {
                cachedProfile.photoURL = downloadURL;
                notifyObservers();
            }
            
            return downloadURL;
            
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    }
    
    /**
     * Get current user profile data
     * @returns {Object|null} - User profile object or null if not logged in
     */
    function getCurrentProfile() {
        return cachedProfile;
    }
    
    /**
     * Subscribe to profile changes
     * @param {Function} callback - Function to call when profile changes
     * @returns {Function} - Unsubscribe function
     */
    function subscribe(callback) {
        profileObservers.push(callback);
        
        // Immediately notify with current data
        if (cachedProfile) {
            callback(cachedProfile);
        }
        
        // Return unsubscribe function
        return () => {
            profileObservers = profileObservers.filter(observer => observer !== callback);
        };
    }
    
    /**
     * Notify all observers of profile changes
     */
    function notifyObservers() {
        profileObservers.forEach(observer => {
            observer(cachedProfile);
        });
    }
    
    /**
     * Update the UI with profile data
     * @param {string} selector - CSS selector for the profile image element
     */
    function updateProfileUI(selector = '.profile-image') {
        if (!cachedProfile) return;
        
        // Update profile images
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.tagName.toLowerCase() === 'img') {
                element.src = cachedProfile.photoURL;
                element.alt = `${cachedProfile.name}'s profile picture`;
            } else {
                element.style.backgroundImage = `url(${cachedProfile.photoURL})`;
            }
        });
        
        // Update side menu username if present
        const sideMenuUserName = document.getElementById('sideMenuUserName');
        if (sideMenuUserName) {
            sideMenuUserName.textContent = cachedProfile.name || 'My Account';
        }
    }
    
    // Public API
    return {
        init,
        getCurrentProfile,
        updateProfilePicture,
        subscribe,
        updateProfileUI
    };
})();

// Export for use in other modules
window.UserProfileUtil = UserProfileUtil;