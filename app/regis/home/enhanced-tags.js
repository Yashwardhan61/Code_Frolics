/**
 * Enhanced tagging and family member addition system
 * For Yaadoo ka Baksa family archive application
 */

// Initialize tag and member systems when document is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize enhanced tag input
  initTagSystem();
  
  // Initialize enhanced member input
  initMemberSystem();
  
  // Initialize story tags in timeline for filtering
  initStoryTagsInTimeline();
});

/**
 * Enhanced tag system
 */
function initTagSystem() {
  // Get necessary elements
  const tagInputContainer = document.getElementById('tagInputContainer');
  if (!tagInputContainer) {
    console.warn('Tag input container not found');
    return;
  }
  
  // Get or create tag input wrapper
  let tagInputWrapper = tagInputContainer.querySelector('.tag-input-wrapper');
  if (!tagInputWrapper) {
    // If the wrapper doesn't exist, create the enhanced tag input structure
    tagInputContainer.innerHTML = `
      <div class="tag-input-wrapper">
        <div class="tags-container"></div>
        <input type="text" class="tag-input" placeholder="Add tags..." aria-label="Add tags">
      </div>
      <div class="tag-suggestions"></div>
      <div class="tag-info">Add tags to help organize and find your stories (e.g. holiday, wedding, childhood)</div>
      <div class="popular-tags"></div>
      <input type="hidden" id="storyTags" name="storyTags">
    `;
    tagInputWrapper = tagInputContainer.querySelector('.tag-input-wrapper');
  }

  // Get required elements
  const tagsContainer = tagInputContainer.querySelector('.tags-container');
  const tagInput = tagInputContainer.querySelector('.tag-input');
  const tagSuggestions = tagInputContainer.querySelector('.tag-suggestions');
  const hiddenInput = document.getElementById('storyTags');
  const popularTagsContainer = tagInputContainer.querySelector('.popular-tags');
  
  // Tags storage
  const tags = new Set();
  
  // Check for existing tags (for edit mode)
  if (hiddenInput && hiddenInput.value) {
    hiddenInput.value.split(',').forEach(tag => {
      if (tag.trim()) {
        addTag(tag.trim());
      }
    });
  }
  
  // Track if suggestions are currently visible
  let isSuggestionsVisible = false;
  
  // Focus on input when clicking the wrapper
  tagInputWrapper.addEventListener('click', () => {
    tagInput.focus();
  });

  // Add tag when pressing Enter or comma
  tagInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      
      // Get current active suggestion if there's one
      const activeSuggestion = tagSuggestions.querySelector('.tag-suggestion.active');
      
      if (activeSuggestion && isSuggestionsVisible) {
        // Add the selected suggestion
        addTag(activeSuggestion.dataset.tag);
      } else {
        // Add the manually typed tag
        const tag = tagInput.value.trim();
        if (tag) {
          addTag(tag);
        }
      }
      
      // Clear input and hide suggestions
      tagInput.value = '';
      hideSuggestions();
    } else if (event.key === 'Backspace' && tagInput.value === '') {
      // Remove the last tag when pressing Backspace on empty input
      const tagElements = tagsContainer.querySelectorAll('.tag');
      if (tagElements.length > 0) {
        const lastTag = tagElements[tagElements.length - 1].querySelector('.tag-text').textContent;
        removeTag(lastTag);
      }
    } else if (event.key === 'ArrowDown' && isSuggestionsVisible) {
      // Navigate through suggestions with arrow keys
      event.preventDefault();
      navigateSuggestion(1);
    } else if (event.key === 'ArrowUp' && isSuggestionsVisible) {
      event.preventDefault();
      navigateSuggestion(-1);
    } else if (event.key === 'Escape') {
      // Hide suggestions on Escape
      hideSuggestions();
    }
  });

  // Show suggestions when typing
  tagInput.addEventListener('input', () => {
    const query = tagInput.value.trim();
    if (query.length > 0) {
      showSuggestions(query);
    } else {
      hideSuggestions();
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (event) => {
    if (!tagInputContainer.contains(event.target)) {
      hideSuggestions();
    }
  });

  // Add a tag to the container
  function addTag(tag) {
    // Remove special characters and trim
    tag = tag.replace(/[,;]/g, '').trim();
    
    // Skip empty tags or duplicates
    if (!tag || tags.has(tag.toLowerCase())) return;
    
    // Add to tags collection
    tags.add(tag.toLowerCase());
    
    // Create tag element
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
      <span class="tag-text">${tag}</span>
      <span class="tag-remove" data-tag="${tag.toLowerCase()}">×</span>
    `;
    
    // Add tag to container
    tagsContainer.insertBefore(tagElement, tagInput);
    
    // Update hidden input
    updateHiddenInput();
    
    // Save to popular tags
    saveTagToPopular(tag);
  }

  // Remove a tag from the container
  function removeTag(tag) {
    tag = tag.toLowerCase();
    
    // Remove from tags collection
    tags.delete(tag);
    
    // Find and remove the element
    const tagElements = tagsContainer.querySelectorAll('.tag');
    tagElements.forEach(el => {
      if (el.querySelector('.tag-text').textContent.toLowerCase() === tag) {
        el.remove();
      }
    });
    
    // Update hidden input
    updateHiddenInput();
  }

  // Update the hidden input with comma-separated tags
  function updateHiddenInput() {
    if (hiddenInput) {
      hiddenInput.value = Array.from(tags).join(',');
    }
  }

  // Show tag suggestions based on query
  function showSuggestions(query) {
    if (query === '') {
      hideSuggestions();
      return;
    }
    
    // Show the suggestions container
    tagSuggestions.classList.add('active');
    isSuggestionsVisible = true;
    
    // Get popular tags from storage for suggestions
    getPopularTags().then(popularTags => {
      // Filter tags that match the query
      const filteredTags = popularTags
        .filter(tag => tag.text.toLowerCase().includes(query.toLowerCase()))
        .filter(tag => !tags.has(tag.text.toLowerCase()))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Show top 5 suggestions
      
      // Add the current query as a suggestion if it's not in the list
      const queryLower = query.toLowerCase();
      if (!filteredTags.some(tag => tag.text.toLowerCase() === queryLower) && 
          !tags.has(queryLower)) {
        filteredTags.unshift({ text: query, count: 0 });
      }
      
      // Generate suggestions HTML
      if (filteredTags.length > 0) {
        tagSuggestions.innerHTML = filteredTags.map((tag, index) => `
          <div class="tag-suggestion ${index === 0 ? 'active' : ''}" data-tag="${tag.text}">
            ${tag.text}
            ${tag.count > 0 ? `<span class="tag-suggestion-count">${tag.count}</span>` : ''}
          </div>
        `).join('');
        
        // Add click event to suggestions
        const suggestions = tagSuggestions.querySelectorAll('.tag-suggestion');
        suggestions.forEach(suggestion => {
          suggestion.addEventListener('click', () => {
            addTag(suggestion.dataset.tag);
            tagInput.value = '';
            hideSuggestions();
            tagInput.focus();
          });
          
          // Add hover effect to remove active class from others
          suggestion.addEventListener('mouseenter', () => {
            suggestions.forEach(s => s.classList.remove('active'));
            suggestion.classList.add('active');
          });
        });
      } else {
        hideSuggestions();
      }
    });
  }

  // Hide tag suggestions
  function hideSuggestions() {
    tagSuggestions.classList.remove('active');
    isSuggestionsVisible = false;
  }
  
  // Navigate through suggestions
  function navigateSuggestion(direction) {
    const suggestions = tagSuggestions.querySelectorAll('.tag-suggestion');
    if (!suggestions.length) return;
    
    // Find current active suggestion
    let activeIndex = -1;
    suggestions.forEach((suggestion, index) => {
      if (suggestion.classList.contains('active')) {
        activeIndex = index;
      }
    });
    
    // Calculate new active index
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = suggestions.length - 1;
    if (newIndex >= suggestions.length) newIndex = 0;
    
    // Update active suggestion
    suggestions.forEach(suggestion => suggestion.classList.remove('active'));
    suggestions[newIndex].classList.add('active');
    
    // Ensure the active suggestion is visible
    suggestions[newIndex].scrollIntoView({ block: 'nearest' });
  }

  // Handle tag removal by click
  tagsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('tag-remove')) {
      const tag = event.target.dataset.tag;
      removeTag(tag);
      tagInput.focus();
    }
  });

  // Load and display popular tags
  loadPopularTags();
  
  // Load popular tags from storage and display them
  function loadPopularTags() {
    getPopularTags().then(popularTags => {
      // Sort by count and take top 5
      const topTags = popularTags
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Show popular tags if there are any
      if (topTags.length > 0) {
        popularTagsContainer.innerHTML = `
          <div style="margin-bottom: 6px; font-size: 12px; color: #666;">Popular tags:</div>
        `;
        
        // Add each popular tag
        topTags.forEach(tag => {
          const tagElement = document.createElement('div');
          tagElement.className = 'popular-tag';
          tagElement.textContent = tag.text;
          
          tagElement.addEventListener('click', () => {
            if (!tags.has(tag.text.toLowerCase())) {
              addTag(tag.text);
              tagInput.focus();
            }
          });
          
          popularTagsContainer.appendChild(tagElement);
        });
      }
    });
  }

  // Get popular tags from storage
  async function getPopularTags() {
    try {
      // Get from Firebase or create empty array
      const auth = firebase.auth();
      if (!auth.currentUser) return [];
      
      const db = firebase.database();
      const userEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      const tagsRef = db.ref(`users/${userEmail}/popularTags`);
      
      const snapshot = await tagsRef.once('value');
      const tagsData = snapshot.val() || {};
      
      // Convert to array
      return Object.entries(tagsData).map(([text, count]) => ({
        text,
        count
      }));
    } catch (error) {
      console.error('Error getting popular tags:', error);
      return [];
    }
  }

  // Save tag to popular tags
  async function saveTagToPopular(tag) {
    try {
      const tagText = tag.trim().toLowerCase();
      if (!tagText) return;
      
      const auth = firebase.auth();
      if (!auth.currentUser) return;
      
      const db = firebase.database();
      const userEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      const tagRef = db.ref(`users/${userEmail}/popularTags/${tagText}`);
      
      // Get current count
      const snapshot = await tagRef.once('value');
      const currentCount = snapshot.val() || 0;
      
      // Update count
      await tagRef.set(currentCount + 1);
    } catch (error) {
      console.error('Error saving popular tag:', error);
    }
  }
}

/**
 * Enhanced family member system
 */
function initMemberSystem() {
  // Get necessary elements
  const memberInputContainer = document.getElementById('memberInputContainer');
  if (!memberInputContainer) {
    console.warn('Member input container not found');
    return;
  }
  
  // Get or create member input wrapper
  let memberInputWrapper = memberInputContainer.querySelector('.members-input-wrapper');
  if (!memberInputWrapper) {
    // If the wrapper doesn't exist, create the enhanced member input structure
    memberInputContainer.innerHTML = `
      <div class="members-input-wrapper">
        <div class="members-container"></div>
        <input type="text" class="member-input" placeholder="Add family members by email..." aria-label="Add family members">
      </div>
      <div class="member-suggestions"></div>
      <div class="member-info">Share stories with family members or create stories together</div>
      <div class="recent-contacts"></div>
      <input type="hidden" id="storyMembers" name="storyMembers">
    `;
    memberInputWrapper = memberInputContainer.querySelector('.members-input-wrapper');
  }

  // Get required elements
  const membersContainer = memberInputContainer.querySelector('.members-container');
  const memberInput = memberInputContainer.querySelector('.member-input');
  const memberSuggestions = memberInputContainer.querySelector('.member-suggestions');
  const hiddenInput = document.getElementById('storyMembers');
  const recentContactsContainer = memberInputContainer.querySelector('.recent-contacts');
  const memberInfo = memberInputContainer.querySelector('.member-info');
  
  // Members storage
  const members = new Set();
  
  // Check for existing members (for edit mode)
  if (hiddenInput && hiddenInput.value) {
    hiddenInput.value.split(',').forEach(member => {
      if (member.trim()) {
        addMember(member.trim(), true); // Skip validation for existing members
      }
    });
  }
  
  // Track if suggestions are currently visible
  let isSuggestionsVisible = false;
  let isCheckingEmail = false;
  
  // Focus on input when clicking the wrapper
  memberInputWrapper.addEventListener('click', () => {
    memberInput.focus();
  });

  // Add member when pressing Enter or semicolon
  memberInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' || event.key === ';') {
      event.preventDefault();
      
      // Get current active suggestion if there's one
      const activeSuggestion = memberSuggestions.querySelector('.member-suggestion.active');
      
      if (activeSuggestion && isSuggestionsVisible) {
        // Add the selected suggestion
        addMember(activeSuggestion.dataset.email);
      } else {
        // Add the manually typed member
        const email = memberInput.value.trim();
        if (email) {
          await addMember(email);
        }
      }
      
      // Clear input and hide suggestions
      memberInput.value = '';
      hideSuggestions();
    } else if (event.key === 'Backspace' && memberInput.value === '') {
      // Remove the last member when pressing Backspace on empty input
      const memberElements = membersContainer.querySelectorAll('.member-tag');
      if (memberElements.length > 0) {
        const lastMember = memberElements[memberElements.length - 1].querySelector('.member-tag-text').textContent;
        removeMember(lastMember);
      }
    } else if (event.key === 'ArrowDown' && isSuggestionsVisible) {
      // Navigate through suggestions with arrow keys
      event.preventDefault();
      navigateSuggestion(1);
    } else if (event.key === 'ArrowUp' && isSuggestionsVisible) {
      event.preventDefault();
      navigateSuggestion(-1);
    } else if (event.key === 'Escape') {
      // Hide suggestions on Escape
      hideSuggestions();
    }
  });

  // Show suggestions when typing
  memberInput.addEventListener('input', () => {
    const query = memberInput.value.trim();
    if (query.length > 0) {
      showSuggestions(query);
    } else {
      hideSuggestions();
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (event) => {
    if (!memberInputContainer.contains(event.target)) {
      hideSuggestions();
    }
  });

  // Add a member to the container
  async function addMember(email, skipValidation = false) {
    // Basic validation and cleanup
    email = email.replace(/[;,]/g, '').trim().toLowerCase();
    
    // Skip empty emails or duplicates
    if (!email || members.has(email)) return;
    
    // Validate email format
    if (!isValidEmail(email)) {
      showMemberError('Please enter a valid email address');
      return;
    }
    
    // Skip further validation if requested (for existing members)
    if (!skipValidation) {
      // Show checking state
      isCheckingEmail = true;
      showCheckingState();
      
      try {
        // Check if user exists
        const exists = await checkUserExists(email);
        
        if (!exists) {
          showMemberError('This email is not registered in the system');
          return;
        }
      } catch (error) {
        console.error('Error checking user:', error);
        showMemberError('Failed to check user. Please try again.');
        return;
      } finally {
        // Hide checking state
        isCheckingEmail = false;
        hideMemberInfo();
      }
    }
    
    // All validations passed, add member
    
    // Add to members collection
    members.add(email);
    
    // Create member element with avatar
    const memberElement = document.createElement('div');
    memberElement.className = 'member-tag';
    memberElement.innerHTML = `
      <span class="member-tag-text">${email}</span>
      <span class="member-tag-remove" data-email="${email}">×</span>
    `;
    
    // Add member to container
    membersContainer.insertBefore(memberElement, memberInput);
    
    // Update hidden input
    updateHiddenInput();
    
    // Save to recent contacts
    saveToRecentContacts(email);
  }

  // Remove a member from the container
  function removeMember(email) {
    email = email.toLowerCase();
    
    // Remove from members collection
    members.delete(email);
    
    // Find and remove the element
    const memberElements = membersContainer.querySelectorAll('.member-tag');
    memberElements.forEach(el => {
      if (el.querySelector('.member-tag-text').textContent.toLowerCase() === email) {
        el.remove();
      }
    });
    
    // Update hidden input
    updateHiddenInput();
  }

  // Update the hidden input with comma-separated members
  function updateHiddenInput() {
    if (hiddenInput) {
      hiddenInput.value = Array.from(members).join(',');
    }
  }

  // Show member suggestions based on query
  function showSuggestions(query) {
    if (query === '' || isCheckingEmail) {
      hideSuggestions();
      return;
    }
    
    // Show the suggestions container
    memberSuggestions.classList.add('active');
    isSuggestionsVisible = true;
    
    // Get recent contacts from storage for suggestions
    getRecentContacts().then(recentContacts => {
      // Filter contacts that match the query
      const filteredContacts = recentContacts
        .filter(contact => contact.toLowerCase().includes(query.toLowerCase()))
        .filter(contact => !members.has(contact.toLowerCase()));
      
      // Add the current query as a suggestion if it's valid email
      if (isValidEmail(query) && !filteredContacts.includes(query) && 
          !members.has(query.toLowerCase())) {
        filteredContacts.unshift(query);
      }
      
      // Generate suggestions HTML
      if (filteredContacts.length > 0) {
        memberSuggestions.innerHTML = filteredContacts.map((contact, index) => {
          // Create avatar from first letter of email
          const firstLetter = contact.charAt(0).toUpperCase();
          
          return `
            <div class="member-suggestion ${index === 0 ? 'active' : ''}" data-email="${contact}">
              <div class="member-avatar">${firstLetter}</div>
              <div class="member-email">${contact}</div>
              <div class="member-status registered">Registered</div>
            </div>
          `;
        }).join('');
        
        // Add click event to suggestions
        const suggestions = memberSuggestions.querySelectorAll('.member-suggestion');
        suggestions.forEach(suggestion => {
          suggestion.addEventListener('click', async () => {
            await addMember(suggestion.dataset.email);
            memberInput.value = '';
            hideSuggestions();
            memberInput.focus();
          });
          
          // Add hover effect to remove active class from others
          suggestion.addEventListener('mouseenter', () => {
            suggestions.forEach(s => s.classList.remove('active'));
            suggestion.classList.add('active');
          });
        });
      } else {
        hideSuggestions();
      }
    });
  }

  // Hide member suggestions
  function hideSuggestions() {
    memberSuggestions.classList.remove('active');
    isSuggestionsVisible = false;
  }
  
  // Navigate through suggestions
  function navigateSuggestion(direction) {
    const suggestions = memberSuggestions.querySelectorAll('.member-suggestion');
    if (!suggestions.length) return;
    
    // Find current active suggestion
    let activeIndex = -1;
    suggestions.forEach((suggestion, index) => {
      if (suggestion.classList.contains('active')) {
        activeIndex = index;
      }
    });
    
    // Calculate new active index
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = suggestions.length - 1;
    if (newIndex >= suggestions.length) newIndex = 0;
    
    // Update active suggestion
    suggestions.forEach(suggestion => suggestion.classList.remove('active'));
    suggestions[newIndex].classList.add('active');
    
    // Ensure the active suggestion is visible
    suggestions[newIndex].scrollIntoView({ block: 'nearest' });
  }

  // Handle member removal by click
  membersContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('member-tag-remove')) {
      const email = event.target.dataset.email;
      removeMember(email);
      memberInput.focus();
    }
  });

  // Show checking state while validating email
  function showCheckingState() {
    hideMemberInfo();
    
    memberInfo.innerHTML = `
      <div class="member-checking">
        <div class="spinner"></div>
        <span>Checking email...</span>
      </div>
    `;
  }
  
  // Show error message
  function showMemberError(message) {
    hideMemberInfo();
    
    memberInfo.innerHTML = `
      <div style="color: #ea4335; font-size: 12px; margin-top: 5px;">
        ${message}
      </div>
    `;
    
    // Hide after 3 seconds
    setTimeout(() => {
      memberInfo.innerHTML = 'Share stories with family members or create stories together';
    }, 3000);
  }
  
  // Hide member info
  function hideMemberInfo() {
    memberInfo.innerHTML = 'Share stories with family members or create stories together';
  }

  // Load and display recent contacts
  loadRecentContacts();
  
  // Load recent contacts from storage and display them
  function loadRecentContacts() {
    getRecentContacts().then(recentContacts => {
      // Take the 5 most recent
      const topContacts = recentContacts.slice(0, 5);
      
      // Show recent contacts if there are any
      if (topContacts.length > 0) {
        recentContactsContainer.innerHTML = `
          <div style="margin-bottom: 6px; font-size: 12px; color: #666;">Recent contacts:</div>
        `;
        
        // Add each recent contact
        topContacts.forEach(contact => {
          // Create avatar from first letter of email
          const firstLetter = contact.charAt(0).toUpperCase();
          
          const contactElement = document.createElement('div');
          contactElement.className = 'recent-contact';
          contactElement.innerHTML = `
            <div class="recent-contact-avatar">${firstLetter}</div>
            <span>${contact}</span>
          `;
          
          contactElement.addEventListener('click', async () => {
            if (!members.has(contact.toLowerCase())) {
              await addMember(contact);
              memberInput.focus();
            }
          });
          
          recentContactsContainer.appendChild(contactElement);
        });
      }
    });
  }

  // Get recent contacts from storage
  async function getRecentContacts() {
    try {
      // Get from Firebase or create empty array
      const auth = firebase.auth();
      if (!auth.currentUser) return [];
      
      const db = firebase.database();
      const userEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      const contactsRef = db.ref(`users/${userEmail}/recentContacts`);
      
      const snapshot = await contactsRef.once('value');
      const contactsData = snapshot.val() || [];
      
      return Array.isArray(contactsData) ? contactsData : [];
    } catch (error) {
      console.error('Error getting recent contacts:', error);
      return [];
    }
  }

  // Save contact to recent contacts
  async function saveToRecentContacts(email) {
    try {
      const contactEmail = email.trim().toLowerCase();
      if (!contactEmail) return;
      
      const auth = firebase.auth();
      if (!auth.currentUser) return;
      
      const db = firebase.database();
      const userEmail = auth.currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      const contactsRef = db.ref(`users/${userEmail}/recentContacts`);
      
      // Get current contacts
      const snapshot = await contactsRef.once('value');
      const contacts = snapshot.val() || [];
      
      // Make sure contacts is an array
      const contactsArray = Array.isArray(contacts) ? contacts : [];
      
      // Remove the contact if it's already in the list
      const filteredContacts = contactsArray.filter(c => c.toLowerCase() !== contactEmail);
      
      // Add the contact to the beginning
      filteredContacts.unshift(contactEmail);
      
      // Keep only the 20 most recent
      const limitedContacts = filteredContacts.slice(0, 20);
      
      // Update contacts
      await contactsRef.set(limitedContacts);
    } catch (error) {
      console.error('Error saving recent contact:', error);
    }
  }
  
  // Check if email exists in the system
  async function checkUserExists(email) {
    // Format email to match Firebase paths
    const safeEmail = email.replace(/\./g, "_").replace(/@/g, "_");
    
    try {
      const db = firebase.database();
      const userRef = db.ref(`users/${safeEmail}`);
      const snapshot = await userRef.once('value');
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking user:', error);
      throw error;
    }
  }
  
  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Initialize story tags in timeline for filtering
 */
function initStoryTagsInTimeline() {
  // We'll implement this when rendering stories in the main file
  // This just handles click events for the tags
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('story-tag')) {
      const tag = event.target.textContent.trim();
      filterStoriesByTag(tag);
    }
  });
}

// Filter stories by tag
function filterStoriesByTag(tag) {
  // Get search input
  const searchInput = document.getElementById('searchInput');
  const filterBy = document.getElementById('filterBy');
  
  if (searchInput && filterBy) {
    // Set filter to tag
    filterBy.value = 'tag';
    
    // Set search input value
    searchInput.value = tag;
    
    // Trigger search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.click();
    }
  }
}

// Export the tag and member initialization functions so they can be used in other files
window.initTagSystem = initTagSystem;
window.initMemberSystem = initMemberSystem;