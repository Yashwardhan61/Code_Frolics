document.addEventListener('DOMContentLoaded', () => {
    // Film strip generation
    const filmStrip = document.querySelector('.film-strip');
    const numberOfFrames = 20; // Number of frames to create
    
    // Generate film frames with random images
    for (let i = 0; i < numberOfFrames * 2; i++) {
        const frame = document.createElement('div');
        frame.className = 'film-frame';
        
        // Create and add image
        const img = document.createElement('img');
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        img.src = randomImageUrl;
        img.alt = 'Memory frame';
        img.loading = 'lazy';
        frame.appendChild(img);
        filmStrip.appendChild(frame);
    }

    // Initialize modal
    initializeModal();
});

// Modal initialization and event handlers
function initializeModal() {
    const modal = document.getElementById('modal');
    const treasureBox = document.getElementById('treasureBox');
    const closeModal = document.getElementById('closeModal');
    const getStartedBtn = document.getElementById('getStartedBtn');

    if (!modal || !treasureBox || !closeModal || !getStartedBtn) {
        console.error('One or more modal elements not found:', {
            modal: !!modal,
            treasureBox: !!treasureBox,
            closeModal: !!closeModal,
            getStartedBtn: !!getStartedBtn
        });
        return;
    }

    // Open modal when clicking on treasure box
    treasureBox.addEventListener('click', () => {
        console.log('Opening modal');
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    });

    // Close modal function
    const closeModalFunction = () => {
        modal.classList.remove('fade-in');
        modal.classList.add('hidden');
    };

    // Close button click handler
    closeModal.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunction();
        }
    });

    // Get Started button click handler
    getStartedBtn.addEventListener('click', () => {
        console.log('Get Started clicked');
        // Add your Get Started functionality here
    });

    // Prevent closing when clicking inside modal content
    const modalContent = modal.querySelector('.bg-white');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Modal initialization and event handlers
function initializeModal(openSound) {
    const modal = document.getElementById('modal');
    const treasureBox = document.getElementById('treasureBox');
    const closeModalBtn = document.getElementById('closeModal');
    const getStartedBtn = document.getElementById('getStartedBtn');

    if (!modal || !treasureBox || !closeModalBtn || !getStartedBtn) {
        console.error('One or more modal elements not found');
        return;
    }

    // Open modal when clicking on treasure box
    treasureBox.addEventListener('click', () => {
        console.log('Treasure box clicked'); // Debug log
        if (openSound) {
            openSound.currentTime = 0;
            openSound.play().catch(err => console.log('Audio error:', err));
        }
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
        
        // Add opening animation class
        treasureBox.classList.add('opening');
        
        // Remove the animation class after animation completes
        setTimeout(() => {
            treasureBox.classList.remove('opening');
        }, 1000);
    });

    // Close modal function
    const closeModalFunction = () => {
        modal.classList.remove('fade-in');
        modal.classList.add('hidden');
    };

    // Close button click handler
    closeModalBtn.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunction();
        }
    });

    // Get Started button click handler
    getStartedBtn.addEventListener('click', () => {
        console.log('Get Started clicked!');
        // Add your "Get Started" functionality here
    });

    // Prevent closing when clicking inside modal content
    const modalContent = modal.querySelector('.bg-white');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

    // Modal functionality
    const modal = document.getElementById('modal');
    const treasureBox = document.getElementById('treasureBox');
    const closeModal = document.getElementById('closeModal');
    const getStartedBtn = document.getElementById('getStartedBtn');

    // Open modal when clicking on treasure box
    treasureBox.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    });

    // Close modal functions
    const closeModalFunction = () => {
        modal.classList.add('hidden');
    };

    closeModal.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunction();
        }
    });

    // Get Started button click handler
    getStartedBtn.addEventListener('click', () => {
        // Add your "Get Started" functionality here
        console.log('Get Started clicked!');
    });

    // Prevent closing when clicking inside modal content
    modal.querySelector('div').addEventListener('click', (e) => {
        e.stopPropagation();
    });