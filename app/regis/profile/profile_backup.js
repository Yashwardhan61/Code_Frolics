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