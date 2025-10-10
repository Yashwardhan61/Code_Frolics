// Friend Circle Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Firebase references
  const auth = firebase.auth();
  const db = firebase.database();
  
  // UI Elements
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const addFriendBtn = document.getElementById("addFriendBtn");
  const invitationsBtn = document.getElementById("invitationsBtn");
  const friendSearchContainer = document.getElementById("friendSearchContainer");
  const invitationsContainer = document.getElementById("invitationsContainer");
  const friendEmailInput = document.getElementById("friendEmailInput");
  const searchFriendBtn = document.getElementById("searchFriendBtn");
  const searchResult = document.getElementById("searchResult");
  const pendingInvitations = document.getElementById("pendingInvitations");
  const noInvitations = document.getElementById("noInvitations");
  const friendsLoading = document.getElementById("friendsLoading");
  const friendsEmpty = document.getElementById("friendsEmpty");
  const friendsList = document.getElementById("friendsList");
  const startAddingBtn = document.getElementById("startAddingBtn");
  const friendDetailModal = document.getElementById("friendDetailModal");
  const closeFriendDetailModal = friendDetailModal.querySelector(".close");
  const inviteBadge = document.getElementById("inviteBadge");
  const friendInviteBadge = document.getElementById("friendInviteBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  
  let currentUser = null;
  let currentUserSafeEmail = null;
  let friends = [];
  let invitations = [];
  let selectedFriend = null;

  /* === UI Handlers === */
  
  // Sidebar Toggle
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

  menuBtn?.addEventListener("click", () => {
    if (sideMenu.classList.contains("active")) closeSidebar();
    else openSidebar();
  });
  
  menuOverlay?.addEventListener("click", closeSidebar);
  
  // Panel Toggling
  addFriendBtn.addEventListener("click", () => {
    friendSearchContainer.classList.toggle("hidden");
    invitationsContainer.classList.add("hidden");
    searchResult.classList.add("hidden");
    friendEmailInput.value = "";
    friendEmailInput.focus();
  });
  
  invitationsBtn.addEventListener("click", () => {
    invitationsContainer.classList.toggle("hidden");
    friendSearchContainer.classList.add("hidden");
    loadInvitations();
  });
  
  // Close Panel Buttons
  document.querySelectorAll(".close-panel").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-panel").classList.add("hidden");
    });
  });
  
  // Empty State Button
  startAddingBtn.addEventListener("click", () => {
    friendSearchContainer.classList.remove("hidden");
    friendEmailInput.focus();
  });
  
  // Friend Detail Modal
  closeFriendDetailModal.addEventListener("click", () => {
    friendDetailModal.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  });
  
  /* === Friend Functions === */
  
  // Search for friends
  searchFriendBtn.addEventListener("click", async () => {
    const email = friendEmailInput.value.trim();
    if (!email) return;
    
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    
    if (email === currentUser.email) {
      showToast("You can't add yourself as a friend", "error");
      return;
    }
    
    searchResult.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Searching...</p></div>';
    searchResult.classList.remove("hidden");
    
    try {
      // Check if user exists
      const userSnapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");
      const userData = userSnapshot.val();
      
      if (!userData) {
        searchResult.innerHTML = `
          <div class="empty-state" style="padding: 20px;">
            <p>No user found with this email address</p>
            <p>Make sure the email is correct or invite them to join the app</p>
          </div>
        `;
        return;
      }
      
      const userKey = Object.keys(userData)[0];
      const user = userData[userKey];
      
      // Check if already friends
      const isFriend = friends.some(friend => friend.email === email);
      
      // Check if invitation already sent
      const invitationSent = await checkInvitationSent(email);
      
      // Check if invitation received
      const invitationReceived = await checkInvitationReceived(email);
      
      let actionButton = "";
      
      if (isFriend) {
        actionButton = '<button class="action-btn secondary" disabled>Already Friends</button>';
      } else if (invitationSent) {
        actionButton = '<button class="action-btn secondary" disabled>Invitation Sent</button>';
      } else if (invitationReceived) {
        actionButton = '<button class="action-btn" data-email="' + email + '">Accept Invitation</button>';
      } else {
        actionButton = '<button class="action-btn" data-email="' + email + '">Send Invitation</button>';
      }
      
      const displayName = user.displayName || email.split('@')[0];
      
      searchResult.innerHTML = `
        <div class="user-item">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <h4>${displayName}</h4>
              <p>${email}</p>
            </div>
          </div>
          <div class="user-action">
            ${actionButton}
          </div>
        </div>
      `;
      
      // Add event listener to the action button
      const actionBtn = searchResult.querySelector(".action-btn:not([disabled])");
      if (actionBtn) {
        actionBtn.addEventListener("click", () => {
          const email = actionBtn.getAttribute("data-email");
          if (actionBtn.textContent === "Send Invitation") {
            sendFriendInvitation(email);
          } else if (actionBtn.textContent === "Accept Invitation") {
            acceptInvitation(email);
          }
        });
      }
      
    } catch (error) {
      console.error("Error searching for user:", error);
      searchResult.innerHTML = `
        <div class="empty-state" style="padding: 20px;">
          <p>An error occurred while searching</p>
          <p>Please try again later</p>
        </div>
      `;
    }
  });
  
  // Send friend invitation
  async function sendFriendInvitation(email) {
    try {
      // Get recipient's safe email
      const safeRecipientEmail = email.replace(/\./g, "_").replace(/@/g, "_");
      
      // Create invitation in recipient's invitations
      const invitation = {
        from: {
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split('@')[0]
        },
        timestamp: Date.now(),
        status: "pending"
      };
      
      await db.ref(`users/${safeRecipientEmail}/invitations/${currentUserSafeEmail}`).set(invitation);
      
      // Update UI
      searchResult.querySelector(".action-btn").textContent = "Invitation Sent";
      searchResult.querySelector(".action-btn").disabled = true;
      
      showToast("Friend invitation sent successfully", "success");
    } catch (error) {
      console.error("Error sending invitation:", error);
      showToast("Failed to send invitation. Please try again.", "error");
    }
  }
  
  // Accept friend invitation
  async function acceptInvitation(email) {
    try {
      const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
      
      // Get user data
      const userSnapshot = await db.ref(`users/${safeEmail}`).once("value");
      const userData = userSnapshot.val() || {};
      
      // Add to friends list on both sides
      const friendData = {
        email: email,
        name: userData.displayName || email.split('@')[0],
        timestamp: Date.now()
      };
      
      const myData = {
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        timestamp: Date.now()
      };
      
      // Add to my friends list
      await db.ref(`users/${currentUserSafeEmail}/friends/${safeEmail}`).set(friendData);
      
      // Add to their friends list
      await db.ref(`users/${safeEmail}/friends/${currentUserSafeEmail}`).set(myData);
      
      // Remove invitation
      await db.ref(`users/${currentUserSafeEmail}/invitations/${safeEmail}`).remove();
      
      showToast("Friend added successfully", "success");
      
      // Reload friends list
      loadFriends();
      
      // Close panels and modals
      searchResult.classList.add("hidden");
      friendSearchContainer.classList.add("hidden");
      invitationsContainer.classList.add("hidden");
      
    } catch (error) {
      console.error("Error accepting invitation:", error);
      showToast("Failed to accept invitation. Please try again.", "error");
    }
  }
  
  // Check if invitation was sent
  async function checkInvitationSent(email) {
    try {
      const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
      const snapshot = await db.ref(`users/${safeEmail}/invitations/${currentUserSafeEmail}`).once("value");
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking invitation status:", error);
      return false;
    }
  }
  
  // Check if invitation was received
  async function checkInvitationReceived(email) {
    try {
      const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
      const snapshot = await db.ref(`users/${currentUserSafeEmail}/invitations/${safeEmail}`).once("value");
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking invitation status:", error);
      return false;
    }
  }
  
  // Load pending invitations
  async function loadInvitations() {
    pendingInvitations.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading invitations...</p></div>';
    
    try {
      const snapshot = await db.ref(`users/${currentUserSafeEmail}/invitations`).once("value");
      const invitationsData = snapshot.val() || {};
      
      invitations = Object.entries(invitationsData).map(([key, invitation]) => ({
        id: key,
        ...invitation
      }));
      
      if (invitations.length === 0) {
        pendingInvitations.classList.add("hidden");
        noInvitations.classList.remove("hidden");
        return;
      }
      
      noInvitations.classList.add("hidden");
      pendingInvitations.classList.remove("hidden");
      
      // Sort by timestamp (newest first)
      invitations.sort((a, b) => b.timestamp - a.timestamp);
      
      let html = '';
      
      invitations.forEach(invitation => {
        const timestamp = new Date(invitation.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        
        html += `
          <div class="invitation-item">
            <div class="user-info">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-details">
                <h4>${invitation.from.name}</h4>
                <p>${invitation.from.email}</p>
                <small>Sent ${timeAgo}</small>
              </div>
            </div>
            <div class="invitation-actions">
              <button class="accept-btn" data-email="${invitation.from.email}">Accept</button>
              <button class="reject-btn" data-email="${invitation.from.email}">Decline</button>
            </div>
          </div>
        `;
      });
      
      pendingInvitations.innerHTML = html;
      
      // Add event listeners to buttons
      pendingInvitations.querySelectorAll(".accept-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const email = btn.getAttribute("data-email");
          acceptInvitation(email);
        });
      });
      
      pendingInvitations.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const email = btn.getAttribute("data-email");
          rejectInvitation(email);
        });
      });
      
    } catch (error) {
      console.error("Error loading invitations:", error);
      pendingInvitations.innerHTML = `
        <div class="empty-state" style="padding: 20px;">
          <p>An error occurred while loading invitations</p>
          <p>Please try again later</p>
        </div>
      `;
    }
  }
  
  // Reject invitation
  async function rejectInvitation(email) {
    try {
      const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
      
      // Remove invitation
      await db.ref(`users/${currentUserSafeEmail}/invitations/${safeEmail}`).remove();
      
      showToast("Invitation declined", "success");
      
      // Reload invitations
      loadInvitations();
      
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      showToast("Failed to decline invitation. Please try again.", "error");
    }
  }
  
  // Load friends list
  async function loadFriends() {
    friendsLoading.classList.remove("hidden");
    friendsList.classList.add("hidden");
    friendsEmpty.classList.add("hidden");
    
    try {
      const snapshot = await db.ref(`users/${currentUserSafeEmail}/friends`).once("value");
      const friendsData = snapshot.val() || {};
      
      friends = Object.entries(friendsData).map(([key, friend]) => ({
        id: key,
        ...friend
      }));
      
      friendsLoading.classList.add("hidden");
      
      if (friends.length === 0) {
        friendsEmpty.classList.remove("hidden");
        return;
      }
      
      friendsList.classList.remove("hidden");
      
      // Sort by name
      friends.sort((a, b) => a.name.localeCompare(b.name));
      
      let html = '';
      
      friends.forEach(friend => {
        const timestamp = new Date(friend.timestamp);
        const dateString = timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        html += `
          <div class="friend-card" data-id="${friend.id}">
            <div class="friend-card-header">
              <div class="friend-avatar">
                <i class="fas fa-user"></i>
              </div>
              <h3 class="friend-name">${friend.name}</h3>
              <p class="friend-email">${friend.email}</p>
            </div>
            <div class="friend-card-body">
              <div class="friend-meta">
                <div class="friend-meta-item">
                  <div class="meta-value">0</div>
                  <div class="meta-label">Shared Stories</div>
                </div>
                <div class="friend-meta-item">
                  <div class="meta-value">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div class="meta-label">Since ${dateString}</div>
                </div>
              </div>
              <div class="friend-quick-actions">
                <button class="friend-action-btn share" data-id="${friend.id}">
                  <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="friend-action-btn remove" data-id="${friend.id}">
                  <i class="fas fa-user-minus"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      friendsList.innerHTML = html;
      
      // Add event listeners
      friendsList.querySelectorAll(".friend-card").forEach(card => {
        card.addEventListener("click", (e) => {
          if (!e.target.classList.contains("friend-action-btn")) {
            const friendId = card.getAttribute("data-id");
            openFriendDetail(friendId);
          }
        });
      });
      
      friendsList.querySelectorAll(".friend-action-btn.share").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const friendId = btn.getAttribute("data-id");
          shareWithFriend(friendId);
        });
      });
      
      friendsList.querySelectorAll(".friend-action-btn.remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const friendId = btn.getAttribute("data-id");
          removeFriend(friendId);
        });
      });
      
    } catch (error) {
      console.error("Error loading friends:", error);
      friendsLoading.classList.add("hidden");
      friendsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Friends</h3>
          <p>An error occurred while loading your friends. Please try again later.</p>
          <button class="action-btn" onclick="location.reload()">Reload</button>
        </div>
      `;
      friendsList.classList.remove("hidden");
    }
  }
  
  // Open friend detail modal
  function openFriendDetail(friendId) {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    
    selectedFriend = friend;
    
    // Populate modal
    document.getElementById("friendName").textContent = friend.name;
    document.getElementById("friendEmail").textContent = friend.email;
    document.getElementById("sharedStories").textContent = "0";
    
    const timestamp = new Date(friend.timestamp);
    const dateString = timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById("memberSince").textContent = dateString;
    
    // Show modal
    friendDetailModal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
    
    // Add event listeners
    document.getElementById("shareStoryBtn").onclick = () => {
      shareWithFriend(friendId);
      friendDetailModal.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    };
    
    document.getElementById("removeFriendBtn").onclick = () => {
      removeFriend(friendId);
      friendDetailModal.classList.add("hidden");
      document.body.classList.remove("no-scroll");
    };
  }
  
  // Share story with friend
  function shareWithFriend(friendId) {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    
    // Redirect to home page with share parameter
    window.location.href = `home.html?share=${friendId}`;
  }
  
  // Remove friend
  async function removeFriend(friendId) {
    try {
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;
      
      if (!confirm(`Are you sure you want to remove ${friend.name} from your friends list?`)) {
        return;
      }
      
      // Remove from both sides
      await db.ref(`users/${currentUserSafeEmail}/friends/${friendId}`).remove();
      await db.ref(`users/${friendId}/friends/${currentUserSafeEmail}`).remove();
      
      showToast("Friend removed successfully", "success");
      
      // Reload friends list
      loadFriends();
      
      // Close modal if open
      if (!friendDetailModal.classList.contains("hidden")) {
        friendDetailModal.classList.add("hidden");
        document.body.classList.remove("no-scroll");
      }
      
    } catch (error) {
      console.error("Error removing friend:", error);
      showToast("Failed to remove friend. Please try again.", "error");
    }
  }
  
  // Update invitation badges
  function updateInvitationBadges() {
    const count = invitations.length;
    
    if (count > 0) {
      inviteBadge.textContent = count > 99 ? '99+' : count;
      inviteBadge.classList.remove("hidden");
      friendInviteBadge.textContent = count > 99 ? '99+' : count;
      friendInviteBadge.classList.remove("hidden");
    } else {
      inviteBadge.classList.add("hidden");
      friendInviteBadge.classList.add("hidden");
    }
  }
  
  /* === Helper Functions === */
  
  // Toast notification
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "check-circle";
    if (type === "error") icon = "exclamation-circle";
    if (type === "warning") icon = "exclamation-triangle";
    if (type === "info") icon = "info-circle";
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    const container = document.getElementById("toastContainer");
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  // Email validation
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Time ago formatter
  function getTimeAgo(timestamp) {
    const now = new Date();
    const secondsPast = (now.getTime() - timestamp.getTime()) / 1000;
    
    if (secondsPast < 60) {
      return `${Math.round(secondsPast)} seconds ago`;
    }
    if (secondsPast < 3600) {
      return `${Math.round(secondsPast / 60)} minutes ago`;
    }
    if (secondsPast < 86400) {
      return `${Math.round(secondsPast / 3600)} hours ago`;
    }
    if (secondsPast < 172800) {
      return `yesterday`;
    }
    
    return timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  
  /* === Firebase Auth Listener === */
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    
    currentUser = user;
    currentUserSafeEmail = user.email.replace(/\./g, "_").replace(/@/g, "_");
    
    // Load friends and invitations
    loadFriends();
    
    // Set up real-time listener for invitations
    db.ref(`users/${currentUserSafeEmail}/invitations`).on("value", snapshot => {
      const invitationsData = snapshot.val() || {};
      
      invitations = Object.entries(invitationsData).map(([key, invitation]) => ({
        id: key,
        ...invitation
      }));
      
      updateInvitationBadges();
      
      // If invitations panel is open, update its content
      if (!invitationsContainer.classList.contains("hidden")) {
        loadInvitations();
      }
    });
    
    // Logout button
    logoutBtn?.addEventListener("click", async () => {
      try {
        await auth.signOut();
        window.location.href = "../login.html";
      } catch (error) {
        console.error("Error signing out:", error);
        showToast("Failed to sign out. Please try again.", "error");
      }
    });
  });
});