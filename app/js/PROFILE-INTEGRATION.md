# User Profile Integration Guide

This guide explains how to integrate the shared user profile functionality across pages in the Yaado ka Baksa application.

## Overview

The shared user profile functionality allows all pages in the application to:
- Display the user's profile picture in the navbar
- Access the user's profile data
- Enable profile picture uploads
- Maintain consistent user experience across pages

## How to Integrate

### 1. Include Required CSS Files

Add the following in your page's `<head>` section:

```html
<!-- Shared navbar styles -->
<link href="/app/css/navbar.css" rel="stylesheet">
```

### 2. Add Navbar Container

Replace your existing navbar with:

```html
<!-- Navbar Container -->
<div id="navbarContainer"></div>
```

### 3. Include Required JavaScript Files

Add these scripts before your page's script:

```html
<!-- Shared scripts -->
<script src="/app/js/user-profile.js"></script>
<script src="/app/js/navbar.js"></script>

<script>
    // Initialize UserProfileUtil
    document.addEventListener('DOMContentLoaded', function() {
        if (window.UserProfileUtil) {
            UserProfileUtil.init(firebase.auth(), firebase.database(), firebase.storage());
        }
    });
</script>
```

### 4. Using the Profile Utility API

The `UserProfileUtil` object provides the following methods:

- `getCurrentProfile()` - Returns the current user's profile data
- `updateProfilePicture(file, progressCallback)` - Updates the user's profile picture
- `subscribe(callback)` - Subscribe to profile changes
- `updateProfileUI(selector)` - Updates profile image elements with the current user's photo

Example:

```javascript
// Get current profile
const profile = UserProfileUtil.getCurrentProfile();
console.log(`Logged in as: ${profile.name}`);

// Listen for profile changes
const unsubscribe = UserProfileUtil.subscribe(profile => {
    if (profile) {
        console.log(`Profile updated: ${profile.name}`);
    }
});

// Update profile picture with progress indicator
const fileInput = document.getElementById('profileImageInput');
fileInput.onchange = e => {
    const file = e.target.files[0];
    if (file) {
        UserProfileUtil.updateProfilePicture(file, progress => {
            console.log(`Upload progress: ${progress}%`);
        })
        .then(url => {
            console.log(`Upload complete: ${url}`);
        })
        .catch(error => {
            console.error(`Upload failed: ${error.message}`);
        });
    }
};
```

## Template Page

For new pages, you can copy the template from `/app/templates/page-template.html` which already includes all the necessary code for integrating the user profile functionality.