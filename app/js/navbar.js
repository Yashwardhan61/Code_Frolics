/**
 * Common Navbar Component
 * This script creates a consistent navbar across all pages with user profile picture.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if navbar placeholder exists
    const navbarPlaceholder = document.getElementById('navbarContainer');
    if (!navbarPlaceholder) return;
    
    // Create navbar HTML
    const navbarHTML = `
        <nav class="navbar">
            <div class="logo-section">
                <img src="/app/logo.jpeg" alt="Logo">
                <h2 class="brand-title">Yaado ka Baksa</h2>
            </div>
            
            <div class="nav-actions">
                <div class="profile-image-container" id="profileImageContainer">
                    <img id="navProfileImage" src="https://via.placeholder.com/40" alt="Profile" class="nav-profile-image">
                </div>
                
                <!-- Hamburger Menu -->
                <div class="menu-icon" id="menuIcon" title="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            
            <!-- Dropdown Menu -->
            <div class="dropdown" id="dropdownMenu">
                <div class="dropdown-profile">
                    <img id="dropdownProfileImage" src="https://via.placeholder.com/40" alt="Profile" class="dropdown-profile-image">
                    <div class="dropdown-profile-info">
                        <span id="dropdownUserName">User Name</span>
                        <span id="dropdownUserEmail">user@example.com</span>
                    </div>
                </div>
                <a href="/app/regis/profile/profile.html">My Profile</a>
                <a href="/app/regis/notifications.html">Notifications</a>
                <a href="/app/regis/feedback.html">Feedback</a>
                <a href="/app/regis/about.html">About Us</a>
                <button id="logoutBtn" class="btn secondary">Logout</button>
            </div>
        </nav>
    `;
    
    // Insert navbar
    navbarPlaceholder.innerHTML = navbarHTML;
    
    // Add event listeners
    const menuIcon = document.getElementById('menuIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Toggle dropdown menu
    menuIcon?.addEventListener('click', () => {
        const isOpen = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isOpen ? 'none' : 'block';
        menuIcon.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', event => {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
            menuIcon.classList.remove('active');
        }
    });
    
    // Handle logout
    logoutBtn?.addEventListener('click', async () => {
        try {
            // Check if Firebase is initialized and user is logged in
            if (window.firebase && window.firebase.auth) {
                await window.firebase.auth().signOut();
                window.location.href = '/app/regis/login.html';
            }
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    });
    
    // Initialize profile if UserProfileUtil is available
    if (window.UserProfileUtil) {
        // Update profile image when profile data changes
        window.UserProfileUtil.subscribe(profile => {
            if (!profile) return;
            
            const navProfileImage = document.getElementById('navProfileImage');
            const dropdownProfileImage = document.getElementById('dropdownProfileImage');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserEmail = document.getElementById('dropdownUserEmail');
            
            // Update profile images
            if (navProfileImage) {
                navProfileImage.src = profile.photoURL;
                navProfileImage.alt = `${profile.name}'s profile`;
            }
            
            if (dropdownProfileImage) {
                dropdownProfileImage.src = profile.photoURL;
            }
            
            // Update user info in dropdown
            if (dropdownUserName) {
                dropdownUserName.textContent = profile.name;
            }
            
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = profile.email;
            }
        });
    }
});