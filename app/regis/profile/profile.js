// Navbar dropdown toggle
const menuIcon = document.getElementById('menuIcon');
const dropdownMenu = document.getElementById('dropdownMenu');
menuIcon.addEventListener('click', () => {
    const isOpen = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isOpen ? 'none' : 'block';
    menuIcon.classList.toggle('active');
});

// Overlay and popups
const overlay = document.getElementById('overlay');
const popupUpload = document.getElementById('popupUpload');
const popupEdit = document.getElementById('popupEdit');
const uploadBtn = document.getElementById('uploadBtn');
const editBtn = document.getElementById('editBtn');

uploadBtn.onclick = () => showPopup(popupUpload);
editBtn.onclick = () => showPopup(popupEdit);

function showPopup(popup) {
    overlay.style.display = 'block';
    popup.style.display = 'block';
}
function closePopup() {
    overlay.style.display = 'none';
    popupUpload.style.display = 'none';
    popupEdit.style.display = 'none';
}

// Profile Picture Update
const addIcon = document.getElementById('addIcon');
const profileImage = document.getElementById('profileImage');
addIcon.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = evt => profileImage.src = evt.target.result;
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
});

// Save Profile
function saveProfile() {
    const usernameInput = document.getElementById('usernameInput');
    const nameInput = document.getElementById('nameInput');
    const descInput = document.getElementById('descInput');

    const username = usernameInput.value.trim();
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();

    const usernamePattern = /^[A-Za-z0-9_]+$/;
    if (!usernamePattern.test(username) || username === "") {
        alert("Username must be unique and can contain only letters, numbers, and underscores.");
        return;
    }
    const wordCount = desc.split(/\s+/).filter(Boolean).length;
    if (wordCount > 50) {
        alert("Description cannot exceed 50 words.");
        return;
    }

    document.getElementById('usernameDisplay').innerText = "@" + username;
    document.getElementById('nameDisplay').innerText = name || "Your Name";
    document.getElementById('descDisplay').innerText = desc || "Write something about yourself...";

    closePopup();
}

// Media Filter
function filterMedia(type) {
    const items = document.querySelectorAll('.media-item');
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target.classList.contains('filter-btn')) event.target.classList.add('active');
    items.forEach(item => {
        if (type === 'all' || item.classList.contains(type)) item.style.display = 'block';
        else item.style.display = 'none';
    });
    closePopup();
}