/**
 * Story Animation Handlers
 * Enhances the home page with attractive animations on stories
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations after Firebase loads stories
  initializeStoryAnimations();

  // Add scroll listener for animation-on-scroll effects
  document.addEventListener('scroll', handleScrollAnimations);
});

/**
 * Sets up all story animations after Firebase has loaded content
 */
function initializeStoryAnimations() {
  // Create a MutationObserver to watch for story elements being added to DOM
  const storiesContainer = document.getElementById('storiesContainer');
  
  if (!storiesContainer) return;

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // Check if stories were added
        const storyElements = document.querySelectorAll('.story');
        if (storyElements.length > 0) {
          // Stop observing temporarily to avoid infinite loops
          observer.disconnect();
          
          // Apply animations to newly added stories
          setupStoryAnimations();
          
          // Add media loading animations
          setupMediaLoadingAnimations();
          
          // Add interactive effects
          setupInteractiveEffects();
          
          // Resume observing
          observer.observe(storiesContainer, { childList: true, subtree: true });
        }
      }
    });
  });

  // Start observing
  observer.observe(storiesContainer, { childList: true, subtree: true });

  // Check for first time visitor
  checkFirstTimeVisitor();
}

/**
 * Applies all animation classes and attributes to stories
 */
function setupStoryAnimations() {
  // Add animation-on-scroll class to stories
  const stories = document.querySelectorAll('.story');
  stories.forEach((story, index) => {
    // Add animate-on-scroll class for additional animations when scrolling
    story.classList.add('animate-on-scroll');
    
    // Add data attributes for animation control
    story.dataset.animationDelay = (index * 0.15).toFixed(2);
    
    // Highlight recent stories (added in last 24 hours)
    const metaText = story.querySelector('.meta')?.textContent || '';
    const dateMatch = metaText.match(/\d{4}-\d{2}-\d{2}/);
    
    if (dateMatch) {
      const storyDate = new Date(dateMatch[0]);
      const now = new Date();
      const hoursDiff = (now - storyDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        story.classList.add('new-story');
      }
    }
  });

  // Initially check which stories are visible
  handleScrollAnimations();
}

/**
 * Handles animation of stories when scrolling
 */
function handleScrollAnimations() {
  const stories = document.querySelectorAll('.animate-on-scroll');
  
  stories.forEach(story => {
    const storyTop = story.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // If story is in viewport
    if (storyTop < windowHeight * 0.85) {
      story.classList.add('visible');
    } else {
      story.classList.remove('visible');
    }
  });
}

/**
 * Sets up animations for media loading
 */
function setupMediaLoadingAnimations() {
  // Add loading class to all media items
  const mediaItems = document.querySelectorAll('.story-media-item');
  
  mediaItems.forEach(item => {
    // Add loading class initially
    item.classList.add('loading');
    
    // Images
    const img = item.querySelector('img');
    if (img) {
      if (img.complete) {
        item.classList.remove('loading');
      } else {
        img.addEventListener('load', () => {
          item.classList.remove('loading');
        });
      }
    }
    
    // Videos
    const video = item.querySelector('video');
    if (video) {
      if (video.readyState >= 2) {
        item.classList.remove('loading');
      } else {
        video.addEventListener('loadeddata', () => {
          item.classList.remove('loading');
        });
      }
    }
    
    // Audio
    const audio = item.querySelector('audio');
    if (audio) {
      if (audio.readyState >= 2) {
        item.classList.remove('loading');
      } else {
        audio.addEventListener('loadeddata', () => {
          item.classList.remove('loading');
        });
      }
    }
  });
}

/**
 * Sets up interactive hover effects for stories
 */
function setupInteractiveEffects() {
  // Add hover animation for more-media buttons
  const moreMediaButtons = document.querySelectorAll('.more-media');
  
  moreMediaButtons.forEach(button => {
    // Add a subtle animation to encourage clicking
    button.addEventListener('mouseenter', () => {
      button.style.animation = 'none';
      setTimeout(() => {
        button.style.animation = 'pulseAttention 2s infinite';
      }, 10);
    });
  });
  
  // Add smooth hover transitions for story media items
  const mediaItems = document.querySelectorAll('.story-media-item');
  
  mediaItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Add subtle lift effect
      item.style.transform = 'scale(1.05)';
      item.style.zIndex = '1';
      item.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    });
    
    item.addEventListener('mouseleave', () => {
      // Reset to original state
      item.style.transform = '';
      item.style.zIndex = '';
      item.style.boxShadow = '';
    });
  });
}

/**
 * Adds special UI elements for first-time visitors
 */
function checkFirstTimeVisitor() {
  const hasVisitedBefore = localStorage.getItem('visitedBefore');
  
  if (!hasVisitedBefore) {
    // Add first-time visitor highlight effect
    const timelineArea = document.querySelector('.timeline-area');
    if (timelineArea) {
      timelineArea.classList.add('first-visit-highlight');
    }
    
    // Record that user has visited
    localStorage.setItem('visitedBefore', 'true');
    
    // Remove first-time highlight after 10 seconds
    setTimeout(() => {
      timelineArea.classList.remove('first-visit-highlight');
    }, 10000);
  }
}

/**
 * Helper function to animate a specific story element
 * Can be called from other parts of the application
 */
function animateStory(storyId) {
  const story = document.getElementById(storyId);
  if (!story) return;
  
  // Reset animation
  story.style.animation = 'none';
  
  // Force reflow
  void story.offsetWidth;
  
  // Apply highlight animation
  story.style.animation = 'glow 2s';
}

// Export functions for use in other scripts
window.storyAnimations = {
  animateStory,
  setupStoryAnimations
};