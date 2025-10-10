/* Firebase is imported via script tags in HTML file */

/* ===== Firebase Config ===== */
// Firebase is initialized in auth.js

/* ===== Main Page Script ===== */
document.addEventListener("DOMContentLoaded", () => {
  /* === Elements === */
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const notificationsContainer = document.getElementById("notificationsList");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const emptyState = document.getElementById("notificationsEmpty");
  const loadingElement = document.getElementById("notificationsLoading");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentFilter = "all";
  let notifications = [];

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

  menuBtn?.addEventListener("click", () => {
    if (sideMenu.classList.contains("active")) closeSidebar();
    else openSidebar();
  });
  
  menuOverlay?.addEventListener("click", closeSidebar);

  /* === Filter Management === */
  if (filterButtons) {
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        // Apply filter
        currentFilter = button.dataset.filter;
        renderNotifications();
      });
    });
  }

  /* === Notification Functions === */
  function renderNotifications() {
    // Clear container
    notificationsContainer.innerHTML = "";
    
    // Filter notifications based on selected filter
    let filteredNotifications = notifications;
    if (currentFilter !== "all" && currentFilter) {
      filteredNotifications = notifications.filter(n => 
        currentFilter === "unread" ? !n.read : n.type === currentFilter
      );
    }
    
    // Show empty state if no notifications
    if (filteredNotifications.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    
    // Hide empty state
    emptyState.classList.add("hidden");
    
    // Sort notifications by date (newest first)
    filteredNotifications.sort((a, b) => b.timestamp - a.timestamp);
    
    // Render each notification
    filteredNotifications.forEach(notification => {
      const notificationEl = createNotificationElement(notification);
      notificationsContainer.appendChild(notificationEl);
    });
  }

  function createNotificationElement(notification) {
    const element = document.createElement("div");
    element.className = `notification ${notification.read ? 'read' : 'unread'} ${notification.type || ''}`;
    
    // Create icon based on notification type
    let iconText = "📣";
    if (notification.type === "anniversary") {
      iconText = "🎉";
    } else if (notification.type === "trip") {
      iconText = "🧳";
    } else if (notification.type === "memory") {
      iconText = "📸";
    }
    
    // Format date
    const notificationDate = new Date(notification.timestamp);
    const today = new Date();
    let dateText = "";
    
    if (isToday(notificationDate)) {
      dateText = "Today";
    } else if (isYesterday(notificationDate)) {
      dateText = "Yesterday";
    } else if (isSameYear(notificationDate, today)) {
      dateText = notificationDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    } else {
      dateText = notificationDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    }
    
    // Build notification HTML
    element.innerHTML = `
      <div class="notification-icon">${iconText}</div>
      <div class="notification-content">
        <h3 class="notification-title">${notification.title || 'New Notification'}</h3>
        <p class="notification-message">${notification.message || ''}</p>
        <div class="notification-meta">
          <span class="notification-date">${dateText}</span>
          ${notification.storyId ? '<button class="view-story-btn">View Story</button>' : ''}
        </div>
      </div>
      <div class="notification-actions">
        ${!notification.read ? '<button class="mark-read-btn" title="Mark as read">✓</button>' : ''}
        <button class="dismiss-btn" title="Dismiss">×</button>
      </div>
    `;
    
    // Add event listeners
    const viewBtn = element.querySelector(".view-story-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        if (notification.storyId) {
          // Mark as read
          markNotificationAsRead(notification.id);
          // Redirect to story
          window.location.href = `home.html?story=${notification.storyId}`;
        }
      });
    }
    
    const markReadBtn = element.querySelector(".mark-read-btn");
    if (markReadBtn) {
      markReadBtn.addEventListener("click", () => {
        markNotificationAsRead(notification.id);
        if (!notification.read) {
          element.classList.remove("unread");
          element.classList.add("read");
          notification.read = true;
          markReadBtn.remove();
        }
      });
    }
    
    const dismissBtn = element.querySelector(".dismiss-btn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        // Remove from UI with animation
        element.style.opacity = "0";
        element.style.transform = "translateX(100px)";
        element.style.transition = "all 0.3s ease";
        
        setTimeout(() => {
          element.remove();
          // If no more notifications, show empty state
          if (notificationsContainer.children.length === 0) {
            emptyState.classList.remove("hidden");
          }
        }, 300);
        
        // Remove from database
        dismissNotification(notification.id);
      });
    }
    
    return element;
  }

  async function markNotificationAsRead(notificationId) {
    if (!firebase.auth().currentUser) return;
    
    const safeEmail = firebase.auth().currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const notificationRef = firebase.database().ref(`users/${safeEmail}/notifications/${notificationId}`);
    
    // Update read status
    await notificationRef.update({
      read: true
    });
    
    // Update local data
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  }

  async function dismissNotification(notificationId) {
    if (!firebase.auth().currentUser) return;
    
    const safeEmail = firebase.auth().currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const notificationRef = firebase.database().ref(`users/${safeEmail}/notifications/${notificationId}`);
    
    // Remove from database
    await notificationRef.remove();
    
    // Remove from local data
    notifications = notifications.filter(n => n.id !== notificationId);
  }

  /* === Notification Generator Functions === */
  async function generateTripAnniversaryNotifications(stories) {
    const safeEmail = firebase.auth().currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const today = new Date();
    
    for (const story of stories) {
      // Skip if no date
      if (!story.date) continue;
      
      // Parse the date
      const storyDate = new Date(story.date);
      if (isNaN(storyDate.getTime())) continue;
      
      // Check if it's an anniversary
      const yearsSince = today.getFullYear() - storyDate.getFullYear();
      const sameMonth = today.getMonth() === storyDate.getMonth();
      const sameDay = today.getDate() === storyDate.getDate();
      
      // Skip if it's not an anniversary or it's today
      if (yearsSince <= 0 || !sameMonth || !sameDay) continue;
      
      // Check if we already have a notification for this anniversary
      const notificationExists = notifications.some(n => 
        n.type === "anniversary" && 
        n.storyId === story.id && 
        n.anniversaryYear === yearsSince
      );
      
      if (notificationExists) continue;
      
      // Create notification
      const notificationsRef = firebase.database().ref(`users/${safeEmail}/notifications`);
      const newNotificationRef = notificationsRef.push();
      
      const notification = {
        id: newNotificationRef.key,
        type: "anniversary",
        title: `${yearsSince} Year${yearsSince > 1 ? 's' : ''} Anniversary!`,
        message: `It's been exactly ${yearsSince} year${yearsSince > 1 ? 's' : ''} since your "${story.title || 'memory'}"${story.location ? ' at ' + story.location : ''}!`,
        timestamp: Date.now(),
        read: false,
        storyId: story.id,
        anniversaryYear: yearsSince
      };
      
      await newNotificationRef.set(notification);
    }
  }

  async function generateTripMemoryNotifications(stories) {
    const safeEmail = firebase.auth().currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
    const today = new Date();
    
    for (const story of stories) {
      // Skip if no date
      if (!story.date) continue;
      
      // Parse the date
      const storyDate = new Date(story.date);
      if (isNaN(storyDate.getTime())) continue;
      
      // Check if it's a month-based memory (e.g. 3 months ago, 6 months ago)
      const monthsSince = 
        (today.getFullYear() - storyDate.getFullYear()) * 12 + 
        (today.getMonth() - storyDate.getMonth());
      
      // Skip if not 3, 6, 9 months ago, or if day doesn't match
      if (![3, 6, 9].includes(monthsSince) || today.getDate() !== storyDate.getDate()) continue;
      
      // Check if we already have a notification for this memory
      const notificationExists = notifications.some(n => 
        n.type === "trip" && 
        n.storyId === story.id && 
        n.monthsSince === monthsSince
      );
      
      if (notificationExists) continue;
      
      // Create notification
      const notificationsRef = firebase.database().ref(`users/${safeEmail}/notifications`);
      const newNotificationRef = notificationsRef.push();
      
      const notification = {
        id: newNotificationRef.key,
        type: "memory",
        title: `Memory from ${monthsSince} months ago`,
        message: `Remember your "${story.title || 'story'}"${story.location ? ' at ' + story.location : ''} from ${monthsSince} months ago? Revisit those memories!`,
        timestamp: Date.now(),
        read: false,
        storyId: story.id,
        monthsSince: monthsSince
      };
      
      await newNotificationRef.set(notification);
    }
  }

  /* === Date Helper Functions === */
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  }

  function isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
  }

  /* === Firebase Realtime Listeners === */
  function startNotificationsListener(userEmail) {
    const safeEmail = userEmail.replace(/\./g, "_").replace(/@/g, "_");
    
    // Listen for notifications
    const notificationsRef = firebase.database().ref(`users/${safeEmail}/notifications`);
    notificationsRef.on('value', (snapshot) => {
      loadingElement.classList.add("hidden");
      
      const data = snapshot.val();
      notifications = [];
      
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          notifications.push({
            id: key,
            ...value
          });
        });
      }
      
      // Update UI
      renderNotifications();
    });
    
    // Listen for stories to generate notifications
    const storiesRef = firebase.database().ref(`users/${safeEmail}/stories`);
    storiesRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      const stories = [];
      
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          stories.push({
            id: key,
            ...value
          });
        });
        
        // Generate notifications based on stories
        await generateTripAnniversaryNotifications(stories);
        await generateTripMemoryNotifications(stories);
      }
    });
  }

  /* === Auth Handling === */
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    startNotificationsListener(user.email);

    logoutBtn?.addEventListener("click", async () => {
      await firebase.auth().signOut();
      window.location.href = "../login.html";
    });
  });
});