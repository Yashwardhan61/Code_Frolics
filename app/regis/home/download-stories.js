// Download Stories Feature JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // References to modal elements
  const downloadBtn = document.getElementById('downloadStoriesBtn');
  const downloadModal = document.getElementById('downloadModal');
  const closeDownloadModal = document.getElementById('closeDownloadModal');
  const singleStoryOption = document.getElementById('singleStoryOption');
  const multipleStoriesOption = document.getElementById('multipleStoriesOption');
  const allStoriesOption = document.getElementById('allStoriesOption');
  const singleStorySelector = document.getElementById('singleStorySelector');
  const multipleStoriesSelector = document.getElementById('multipleStoriesSelector');
  const selectSingleStory = document.getElementById('selectSingleStory');
  const storyCheckboxList = document.getElementById('storyCheckboxList');
  const generatePreviewBtn = document.getElementById('generatePreviewBtn');
  const downloadActionBtn = document.getElementById('downloadBtn');
  const downloadPreview = document.getElementById('downloadPreview');
  
  // Global variables
  let allStories = [];
  let selectedStoryIds = [];
  let selectedFormat = 'pdf'; // Default format
  
  // Toggle download modal
  downloadBtn.addEventListener('click', () => {
    downloadModal.classList.remove('hidden');
    loadStories();
  });
  
  // Enhanced close button functionality
  closeDownloadModal.addEventListener('click', () => {
    downloadModal.classList.add('hidden');
    console.log('Download modal closed via close button');
  });
  
  // Add keyboard escape key functionality
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !downloadModal.classList.contains('hidden')) {
      downloadModal.classList.add('hidden');
      console.log('Download modal closed via ESC key');
    }
  });
  
  // Allow clicking outside the modal to close it
  downloadModal.addEventListener('click', (event) => {
    if (event.target === downloadModal) {
      downloadModal.classList.add('hidden');
      console.log('Download modal closed via outside click');
    }
  });
  
  // Toggle between selection options
  singleStoryOption.addEventListener('click', () => {
    setActiveOption(singleStoryOption);
    singleStorySelector.classList.remove('hidden');
    multipleStoriesSelector.classList.add('hidden');
  });
  
  multipleStoriesOption.addEventListener('click', () => {
    setActiveOption(multipleStoriesOption);
    singleStorySelector.classList.add('hidden');
    multipleStoriesSelector.classList.remove('hidden');
  });
  
  allStoriesOption.addEventListener('click', () => {
    setActiveOption(allStoriesOption);
    singleStorySelector.classList.add('hidden');
    multipleStoriesSelector.classList.add('hidden');
  });
  
  // Handle format selection
  const formatOptions = document.querySelectorAll('input[name="downloadFormat"]');
  formatOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      selectedFormat = e.target.value;
    });
  });
  
  // Toggle media options visibility
  const includeMediaCheckbox = document.getElementById('includeMedia');
  const mediaOptionsContainer = document.getElementById('mediaOptions');
  
  includeMediaCheckbox.addEventListener('change', () => {
    if (includeMediaCheckbox.checked) {
      mediaOptionsContainer.style.display = 'block';
    } else {
      mediaOptionsContainer.style.display = 'none';
    }
  });
  
  // Generate preview
  generatePreviewBtn.addEventListener('click', () => {
    updateSelectedStories();
    generatePreview();
  });
  
  // Download the final document
  downloadActionBtn.addEventListener('click', () => {
    updateSelectedStories();
    
    // Update the button text based on the format
    if (selectedFormat === 'scrapbook') {
      downloadActionBtn.innerHTML = 'Creating Scrapbook...';
    } else {
      downloadActionBtn.innerHTML = 'Generating PDF...';
    }
    
    generateDocument();
  });
  
  // Update button text when format changes
  formatOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      selectedFormat = e.target.value;
      if (selectedFormat === 'scrapbook') {
        downloadActionBtn.innerHTML = 'Create Scrapbook';
        generatePreviewBtn.innerHTML = 'Preview Scrapbook';
      } else {
        downloadActionBtn.innerHTML = 'Download PDF';
        generatePreviewBtn.innerHTML = 'Generate Preview';
      }
    });
  });
  
  // Helper function to set active option
  function setActiveOption(activeButton) {
    [singleStoryOption, multipleStoriesOption, allStoriesOption].forEach(btn => {
      btn.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
  
  // Load all stories from Firebase
  async function loadStories() {
    // Show loading state
    selectSingleStory.innerHTML = '<option value="">Loading stories...</option>';
    storyCheckboxList.innerHTML = '<div class="loading">Loading stories...</div>';
    
    try {
      // Use Firebase from the global scope (already initialized in home.js)
      const auth = firebase.auth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      const userEmail = user.email.replace(/\./g, '_').replace(/@/g, '_');
      const db = firebase.database();
      const storiesRef = db.ref(`users/${userEmail}/stories`);
      
      // Get all stories
      const snapshot = await storiesRef.once('value');
      const storiesData = snapshot.val() || {};
      
      // Convert to array and sort by date (newest first)
      allStories = Object.entries(storiesData).map(([id, story]) => ({
        id,
        ...story
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Populate single story dropdown
      populateSingleStoryDropdown(allStories);
      
      // Populate multiple stories checkboxes
      populateMultipleStoriesCheckboxes(allStories);
      
    } catch (error) {
      console.error('Error loading stories:', error);
      selectSingleStory.innerHTML = '<option value="">Error loading stories</option>';
      storyCheckboxList.innerHTML = '<div class="error">Error loading stories</div>';
    }
  }
  
  // Populate single story dropdown
  function populateSingleStoryDropdown(stories) {
    selectSingleStory.innerHTML = '<option value="">Select a story</option>';
    
    stories.forEach(story => {
      const option = document.createElement('option');
      option.value = story.id;
      option.textContent = story.title || 'Untitled Story';
      selectSingleStory.appendChild(option);
    });
  }
  
  // Populate multiple stories checkboxes
  function populateMultipleStoriesCheckboxes(stories) {
    storyCheckboxList.innerHTML = '';
    
    if (stories.length === 0) {
      storyCheckboxList.innerHTML = '<div class="empty-message">No stories found</div>';
      return;
    }
    
    stories.forEach(story => {
      const checkbox = document.createElement('div');
      checkbox.className = 'story-checkbox';
      
      const date = story.date ? new Date(story.date).toLocaleDateString() : 'Unknown date';
      
      checkbox.innerHTML = `
        <input type="checkbox" id="story-${story.id}" value="${story.id}">
        <label for="story-${story.id}" class="story-title">${story.title || 'Untitled Story'}</label>
        <span class="story-date">${date}</span>
      `;
      
      storyCheckboxList.appendChild(checkbox);
    });
  }
  
  // Update the list of selected stories based on current selection mode
  function updateSelectedStories() {
    selectedStoryIds = [];
    
    if (singleStoryOption.classList.contains('active')) {
      // Single story mode
      const selectedId = selectSingleStory.value;
      if (selectedId) {
        selectedStoryIds.push(selectedId);
      }
    } else if (multipleStoriesOption.classList.contains('active')) {
      // Multiple stories mode
      const checkboxes = storyCheckboxList.querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        selectedStoryIds.push(checkbox.value);
      });
    } else {
      // All stories mode
      selectedStoryIds = allStories.map(story => story.id);
    }
  }
  
  // Generate preview of the document
  function generatePreview() {
    if (selectedStoryIds.length === 0) {
      alert('Please select at least one story to download');
      return;
    }
    
    downloadPreview.innerHTML = '';
    
    // Get selected stories data
    const selectedStories = allStories.filter(story => selectedStoryIds.includes(story.id));
    
    // Create preview container
    const previewPages = document.createElement('div');
    previewPages.className = 'preview-pages';
    
    // Create cover page preview if enabled
    const includeCover = document.getElementById('includeCoverPage').checked;
    if (includeCover) {
      previewPages.appendChild(createPreviewPage('cover', selectedFormat, {
        title: 'My Stories',
        storyCount: selectedStories.length
      }));
    }
    
    // Create table of contents if enabled
    const includeTOC = document.getElementById('includeTableOfContents').checked;
    if (includeTOC && selectedStories.length > 1) {
      previewPages.appendChild(createPreviewPage('toc', selectedFormat, {
        stories: selectedStories
      }));
    }
    
    // Create page previews for each story
    selectedStories.forEach((story, index) => {
      previewPages.appendChild(createPreviewPage('story', selectedFormat, { 
        story,
        pageNumber: index + (includeCover ? 1 : 0) + (includeTOC ? 1 : 0)
      }));
    });
    
    downloadPreview.appendChild(previewPages);
  }
  
  // Create a preview page
  function createPreviewPage(type, format, data) {
    const page = document.createElement('div');
    page.className = `preview-page ${format === 'scrapbook' ? 'scrapbook-page' : ''}`;
    
    const content = document.createElement('div');
    content.className = 'page-content';
    
    if (format === 'scrapbook') {
      // Scrapbook-style previews
      switch (type) {
        case 'cover':
          content.innerHTML = `
            <div style="text-align: center; padding-top: 20px; background-color: #f9f3e9; height: 100%; position: relative;">
              <!-- Vintage border -->
              <div style="position: absolute; top: 5px; left: 5px; right: 5px; bottom: 5px; border: 2px dashed #a57b50; pointer-events: none;"></div>
              
              <h1 style="font-size: 32px; margin-bottom: 15px; font-family: 'Dancing Script', cursive; color: #784e2b;">Our Story Collection</h1>
              <div style="font-size: 18px; margin: 20px 0; font-style: italic; color: #6b553a;">A journey through time</div>
              
              <!-- Decorative polaroid -->
              <div style="margin: 0 auto; width: 100px; height: 80px; background: white; padding: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transform: rotate(-3deg);">
                <div style="height: 60px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px;">📔</span>
                </div>
              </div>
              
              <div style="margin-top: 20px; font-size: 16px;">${data.storyCount} ${data.storyCount === 1 ? 'memory' : 'memories'}</div>
              <div style="margin-top: 20px; font-style: italic; font-size: 22px; color: #ab7a45;">Yaadoo ka Baksa</div>
              <div style="margin-top: 10px; font-size: 14px; font-family: Arial, sans-serif;">${new Date().toLocaleDateString()}</div>
            </div>
          `;
          break;
        
        case 'toc':
          let scrapTocHtml = `
            <div style="height: 100%; background-color: #f9f3e9; padding: 15px; position: relative;">
              <h1 style="font-size: 24px; margin-bottom: 15px; text-align: center; font-family: 'Dancing Script', cursive; color: #784e2b;">Memory Index</h1>
              <div style="max-height: 80%; overflow: hidden;">
          `;
          
          data.stories.forEach((story, index) => {
            const isEven = index % 2 === 0;
            scrapTocHtml += `
              <div style="display: flex; margin-bottom: 8px; padding: 5px; background: ${isEven ? 'rgba(255,255,255,0.6)' : 'rgba(165, 123, 80, 0.08)'};">
                <div style="flex-grow: 1; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${story.title || 'Untitled Memory'}</div>
                <div style="margin-left: 5px; font-family: Arial, sans-serif; font-size: 14px;">p.${index + 2}</div>
              </div>
            `;
          });
          
          scrapTocHtml += `
              </div>
              <!-- Decorative element -->
              <div style="position: absolute; bottom: 10px; right: 10px; transform: rotate(15deg); opacity: 0.4;">
                <span style="font-size: 24px;">♥</span>
              </div>
            </div>
          `;
          content.innerHTML = scrapTocHtml;
          break;
        
        case 'story':
          const storyDate = data.story.date ? new Date(data.story.date).toLocaleDateString() : 'Unknown date';
          
          content.innerHTML = `
            <div style="height: 100%; background-color: #f9f3e9; padding: 10px; position: relative;">
              <!-- Title -->
              <div style="background: white; padding: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transform: rotate(-2deg); text-align: center; margin-bottom: 10px;">
                <h2 style="font-size: 18px; margin: 0; font-family: 'Dancing Script', cursive; color: #784e2b;">${data.story.title || 'Untitled Memory'}</h2>
                <div style="font-size: 12px; color: #6b5545;">${storyDate}</div>
              </div>
              
              <!-- Description extract -->
              <div style="font-size: 13px; line-height: 1.4; height: 40px; overflow: hidden; margin-bottom: 10px; font-family: Arial, sans-serif;">
                ${data.story.description?.substring(0, 60) || 'No description'}...
              </div>
              
              <!-- Media placeholder -->
              <div style="display: flex; justify-content: center; margin-top: 5px;">
                <div style="width: 60px; height: 60px; background: white; padding: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transform: rotate(3deg);">
                  <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 20px;">📸</span>
                  </div>
                </div>
              </div>
              
              <!-- Decoration -->
              <div style="position: absolute; bottom: 5px; left: 5px; font-size: 12px; color: #784e2b; transform: rotate(-5deg);">
                ✓ Memories
              </div>
            </div>
          `;
          break;
      }
    } else {
      // Standard PDF-style previews
      switch (type) {
        case 'cover':
          content.innerHTML = `
            <div style="text-align: center; padding-top: 40px;">
              <h1 style="font-size: 32px; margin-bottom: 20px;">${data.title}</h1>
              <div style="font-size: 18px;">A collection of ${data.storyCount} ${data.storyCount === 1 ? 'story' : 'stories'}</div>
              <div style="margin-top: 40px; font-style: italic;">Yaadoo ka Baksa</div>
              <div style="margin-top: 20px;">${new Date().toLocaleDateString()}</div>
            </div>
          `;
          break;
        
        case 'toc':
          let tocHtml = `
            <h1 style="font-size: 24px; margin-bottom: 20px;">Table of Contents</h1>
            <ol style="padding-left: 20px;">
          `;
          
          data.stories.forEach((story, index) => {
            tocHtml += `<li style="margin-bottom: 10px;">
              ${story.title || 'Untitled Story'} 
              <span style="float: right;">Page ${index + 2}</span>
            </li>`;
          });
          
          tocHtml += '</ol>';
          content.innerHTML = tocHtml;
          break;
        
        case 'story':
          const storyDate = data.story.date ? new Date(data.story.date).toLocaleDateString() : 'Unknown date';
          
          content.innerHTML = `
            <h2 style="font-size: 24px; margin-bottom: 10px;">${data.story.title || 'Untitled Story'}</h2>
            <div style="color: #777; margin-bottom: 20px;">${storyDate}</div>
            <div style="font-size: 16px; line-height: 1.6;">${data.story.description?.substring(0, 50) || 'No description'}...</div>
            <div style="background: #f5f5f5; height: 100px; margin-top: 15px; display: flex; align-items: center; justify-content: center;">
              [Media Content]
            </div>
          `;
          break;
      }
    }
    
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    
    if (type === 'story') {
      pageNumber.textContent = data.pageNumber;
    } else if (type === 'toc') {
      pageNumber.textContent = 1;
    }
    
    page.appendChild(content);
    
    if (type !== 'cover') {
      page.appendChild(pageNumber);
    }
    
    return page;
  }
  
  // Helper function to determine media type from URL or path
  function getMediaType(url) {
    if (!url) return 'unknown';
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.mkv'];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    
    url = url.toLowerCase();
    
    for (const ext of imageExtensions) {
      if (url.includes(ext)) return 'image';
    }
    
    for (const ext of videoExtensions) {
      if (url.includes(ext)) return 'video';
    }
    
    for (const ext of audioExtensions) {
      if (url.includes(ext)) return 'audio';
    }
    
    // Try to guess from content type or other indicators
    if (url.includes('image')) return 'image';
    if (url.includes('video')) return 'video';
    if (url.includes('audio')) return 'audio';
    
    return 'unknown';
  }
  
  // Initialize media options visibility
  document.addEventListener('DOMContentLoaded', () => {
    const includeMediaCheckbox = document.getElementById('includeMedia');
    const mediaOptionsContainer = document.getElementById('mediaOptions');
    
    if (includeMediaCheckbox && mediaOptionsContainer) {
      // Initial state
      mediaOptionsContainer.style.display = includeMediaCheckbox.checked ? 'block' : 'none';
    }
  });
  
  // Generate and download the final document
  async function generateDocument() {
    if (selectedStoryIds.length === 0) {
      alert('Please select at least one story to download');
      return;
    }
    
    // Get selected stories data
    const selectedStories = allStories.filter(story => selectedStoryIds.includes(story.id));
    
    // Show progress indicator
    showDownloadProgress();
    
    try {
      // Get customization options
      const includeCover = document.getElementById('includeCoverPage').checked;
      const includeTOC = document.getElementById('includeTableOfContents').checked;
      const includeMedia = document.getElementById('includeMedia').checked;
      
      // Get media specific options
      const includeImages = document.getElementById('includeImages').checked;
      const includeVideos = document.getElementById('includeVideos').checked;
      const includeAudio = document.getElementById('includeAudio').checked;
      const maxImagesPerStory = document.getElementById('maxImagesPerStory').value;
      
      const pageSize = document.getElementById('pageSize').value;
      
      // Create different output based on format
      if (selectedFormat === 'pdf') {
        await generatePDF(selectedStories, {
          includeCover,
          includeTOC,
          includeMedia,
          includeImages,
          includeVideos,
          includeAudio,
          maxImagesPerStory,
          pageSize
        });
      } else {
        await generateScrapbook(selectedStories, {
          includeCover,
          includeTOC,
          includeMedia,
          includeImages,
          includeVideos,
          includeAudio,
          maxImagesPerStory,
          pageSize
        });
      }
      
    } catch (error) {
      console.error('Error generating document:', error);
      hideDownloadProgress();
      alert('Failed to generate document. Please try again.');
    }
  }
  
  // Helper function to fetch media URLs
  async function fetchMediaUrls(story) {
    try {
      if (!story.media || !story.media.length) {
        return [];
      }
      
      const storage = firebase.storage();
      const mediaPromises = story.media.map(async (mediaItem) => {
        try {
          // Check if we already have a URL
          if (mediaItem.url && mediaItem.url.startsWith('http')) {
            return {
              ...mediaItem,
              downloadUrl: mediaItem.url
            };
          }
          
          // Get URL from storage
          const path = mediaItem.path || mediaItem.storagePath;
          if (!path) {
            console.error('Missing path for media item:', mediaItem);
            return null;
          }
          
          // Try to get the download URL
          const storageRef = storage.ref(path);
          const downloadUrl = await storageRef.getDownloadURL();
          
          return {
            ...mediaItem,
            downloadUrl: downloadUrl
          };
        } catch (err) {
          console.error('Error fetching media URL:', err);
          return null;
        }
      });
      
      const mediaResults = await Promise.all(mediaPromises);
      return mediaResults.filter(item => item !== null);
      
    } catch (err) {
      console.error('Error in fetchMediaUrls:', err);
      return [];
    }
  }
  
  // Generate PDF document
  async function generatePDF(stories, options) {
    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.color = '#333';
    
    document.body.appendChild(container);
    
    try {
      // Set up PDF document
      const { jsPDF } = window.jspdf;
      
      // Set page size
      const pageFormats = {
        'a4': 'a4',
        'letter': 'letter',
        'legal': 'legal'
      };
      
      const doc = new jsPDF({
        format: pageFormats[options.pageSize] || 'a4',
        orientation: 'portrait'
      });
      
      let currentPage = 0;
      
      // Add cover page
      if (options.includeCover) {
        container.innerHTML = `
          <div style="text-align: center; padding: 100px 40px;">
            <h1 style="font-size: 32px; margin-bottom: 20px;">My Stories</h1>
            <div style="font-size: 18px;">A collection of ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}</div>
            <div style="margin-top: 80px; font-style: italic;">Yaadoo ka Baksa</div>
            <div style="margin-top: 20px;">${new Date().toLocaleDateString()}</div>
          </div>
        `;
        
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Add table of contents
      if (options.includeTOC && stories.length > 1) {
        let tocHtml = `
          <div style="padding: 40px;">
            <h1 style="font-size: 24px; margin-bottom: 20px;">Table of Contents</h1>
            <ol style="padding-left: 20px;">
        `;
        
        stories.forEach((story, index) => {
          const pageNumber = index + (options.includeCover ? 1 : 0) + (options.includeTOC ? 1 : 0);
          tocHtml += `<li style="margin-bottom: 15px; font-size: 16px;">
            ${story.title || 'Untitled Story'} 
            <span style="float: right;">Page ${pageNumber + 1}</span>
          </li>`;
        });
        
        tocHtml += '</ol></div>';
        container.innerHTML = tocHtml;
        
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Add each story
      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        updateDownloadProgress((i / stories.length) * 100);
        
        // Create story page content
        const storyDate = story.date ? new Date(story.date).toLocaleDateString() : 'Unknown date';
        const storyLocation = story.location || '';
        const storyTags = story.tags || '';
        
        container.innerHTML = `
          <div style="padding: 40px;">
            <h2 style="font-size: 26px; margin-bottom: 10px;">${story.title || 'Untitled Story'}</h2>
            <div style="color: #777; margin-bottom: 10px;">
              <span style="margin-right: 15px;"><strong>Date:</strong> ${storyDate}</span>
              ${storyLocation ? `<span style="margin-right: 15px;"><strong>Location:</strong> ${storyLocation}</span>` : ''}
              ${storyTags ? `<span><strong>Tags:</strong> ${storyTags}</span>` : ''}
            </div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${story.description || 'No description'}</div>
        `;
        
        // Add media if enabled and available
        if (options.includeMedia && story.media && story.media.length) {
          let mediaItems = story.media;
          let mediaTypes = {
            images: 0,
            videos: 0,
            audio: 0
          };
          
          // Count media types
          if (mediaItems && mediaItems.length > 0) {
            mediaItems.forEach(item => {
              const type = getMediaType(item.url || item.path || "");
              if (type === 'image') mediaTypes.images++;
              else if (type === 'video') mediaTypes.videos++;
              else if (type === 'audio') mediaTypes.audio++;
            });
          }
          
          // Filter media based on options
          let filteredMedia = mediaItems.filter(item => {
            const type = getMediaType(item.url || item.path || "");
            if (type === 'image' && !options.includeImages) return false;
            if (type === 'video' && !options.includeVideos) return false;
            if (type === 'audio' && !options.includeAudio) return false;
            return true;
          });
          
          // Limit images if maxImagesPerStory is set
          if (options.maxImagesPerStory !== 'all') {
            const maxImages = parseInt(options.maxImagesPerStory);
            const images = filteredMedia.filter(item => getMediaType(item.url || item.path || "") === 'image');
            const nonImages = filteredMedia.filter(item => getMediaType(item.url || item.path || "") !== 'image');
            
            if (images.length > maxImages) {
              // Keep only the specified number of images
              filteredMedia = [...images.slice(0, maxImages), ...nonImages];
            }
          }
          
          // If we have media to show after filtering
          if (filteredMedia.length > 0) {
            container.innerHTML += `<h3 style="font-size: 18px; margin: 20px 0 15px;">Media</h3>`;
            
            // Fetch actual media URLs
            const mediaWithUrls = await fetchMediaUrls(story);
            
            // Create media gallery
            if (mediaWithUrls.length > 0) {
              // Display media gallery
              container.innerHTML += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">`;
              
              // Add each media item
              for (const media of mediaWithUrls) {
                const mediaType = getMediaType(media.url || media.path || "");
                
                if (mediaType === 'image' && options.includeImages) {
                  container.innerHTML += `
                    <div style="overflow: hidden; border-radius: 4px; border: 1px solid #eee; height: 150px;">
                      <img src="${media.downloadUrl}" alt="Story Image" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                  `;
                } else if (mediaType === 'video' && options.includeVideos) {
                  container.innerHTML += `
                    <div style="overflow: hidden; border-radius: 4px; border: 1px solid #eee; height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                      <div style="font-size: 24px;">🎬</div>
                      <div style="font-size: 12px; margin-top: 8px; color: #666;">Video</div>
                    </div>
                  `;
                } else if (mediaType === 'audio' && options.includeAudio) {
                  container.innerHTML += `
                    <div style="overflow: hidden; border-radius: 4px; border: 1px solid #eee; height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                      <div style="font-size: 24px;">🎵</div>
                      <div style="font-size: 12px; margin-top: 8px; color: #666;">Audio</div>
                    </div>
                  `;
                }
              }
              
              container.innerHTML += `</div>`;
            } else {
              // Display media summary as fallback if URLs couldn't be fetched
              container.innerHTML += `<div style="background: #f5f5f5; padding: 20px; text-align: center;">
                [${filteredMedia.length} of ${story.media.length} media ${filteredMedia.length === 1 ? 'item' : 'items'}]<br>
                <small style="color: #777;">
                  Included: 
                  ${options.includeImages ? `${mediaTypes.images} images` : ''}
                  ${options.includeImages && (options.includeVideos || options.includeAudio) ? ' | ' : ''}
                  ${options.includeVideos ? `${mediaTypes.videos} videos` : ''}
                  ${options.includeVideos && options.includeAudio ? ' | ' : ''}
                  ${options.includeAudio ? `${mediaTypes.audio} audio files` : ''}
                </small>
              </div>`;
            }
          }
        }
        
        container.innerHTML += `</div>`;
        
        // Add page number
        container.innerHTML += `<div style="position: absolute; bottom: 20px; right: 40px; font-size: 12px; color: #777;">
          Page ${currentPage + 1}
        </div>`;
        
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Save the PDF
      const filename = stories.length === 1 
        ? `${stories[0].title || 'Story'}.pdf` 
        : 'My Stories Collection.pdf';
      
      updateDownloadProgress(100, 'Preparing download...');
      
      setTimeout(() => {
        doc.save(filename);
        hideDownloadProgress();
      }, 1000);
      
    } finally {
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  }
  
  // Add HTML content to PDF
  async function addHTMLToPDF(doc, element, pageIndex) {
    if (pageIndex > 0) {
      doc.addPage();
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, pdfHeight);
  }
  
  // Generate Scrapbook format
  async function generateScrapbook(stories, options) {
    // Scrapbook-specific styling with vintage/handmade look
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontFamily = 'Dancing Script, cursive';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.backgroundColor = '#f9f3e9';
    container.style.color = '#5a3e1b';
    
    document.body.appendChild(container);
    
    try {
      // Set up PDF document
      const { jsPDF } = window.jspdf;
      
      const pageFormats = {
        'a4': 'a4',
        'letter': 'letter',
        'legal': 'legal'
      };
      
      const doc = new jsPDF({
        format: pageFormats[options.pageSize] || 'a4',
        orientation: 'portrait'
      });
      
      let currentPage = 0;
      
      // Add cover page with vintage scrapbook styling
      if (options.includeCover) {
        container.innerHTML = `
          <div style="height: 800px; position: relative; background-color: #e9dfc8; overflow: hidden;">
            <!-- Background texture -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.3; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2NjY2MiPjwvcmVjdD4KPC9zdmc+');">
            </div>
            
            <!-- Decorative paper clip -->
            <div style="position: absolute; top: 20px; right: 40px; width: 30px; height: 80px;">
              <svg viewBox="0 0 24 120" xmlns="http://www.w3.org/2000/svg">
                <path d="M6,0 C3,0 0,3 0,6 L0,114 C0,117 3,120 6,120 L18,120 C21,120 24,117 24,114 L24,6 C24,3 21,0 18,0 Z" fill="#b8b8b8"></path>
                <path d="M7,6 C5.5,6 4,7.5 4,9 L4,111 C4,112.5 5.5,114 7,114 L17,114 C18.5,114 20,112.5 20,111 L20,9 C20,7.5 18.5,6 17,6 Z" fill="#d6d6d6"></path>
              </svg>
            </div>
            
            <!-- Main content frame with a vintage border -->
            <div style="position: relative; margin: 40px; height: calc(100% - 80px); border: 15px solid transparent; border-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M5YTg3MSIgc3Ryb2tlLXdpZHRoPSIzIj48L3JlY3Q+CjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTU3YjUwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjUsNSI+PC9yZWN0Pgo8L3N2Zz4=') 15 stretch;">
              
              <!-- Tilt polaroid effect -->
              <div style="position: absolute; width: 250px; height: 200px; top: 60px; left: 50%; transform: translateX(-50%) rotate(-3deg); background: white; padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <div style="width: 100%; height: calc(100% - 40px); background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="#a57b50">
                    <path d="M20,5H10.5L7,2H4C2.9,2 2,2.9 2,4V22L6,18H20C21.1,18 22,17.1 22,16V7C22,5.9 21.1,5 20,5Z"></path>
                  </svg>
                </div>
                <div style="padding: 8px 0; text-align: center; font-size: 14px; font-family: 'Arial', sans-serif; color: #5a3e1b;">Memories</div>
              </div>
              
              <!-- Title and details -->
              <div style="position: relative; text-align: center; margin-top: 270px;">
                <h1 style="font-size: 46px; color: #784e2b; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); margin-bottom: 10px;">Our Story Collection</h1>
                <div style="font-size: 22px; margin: 30px 0; font-style: italic; color: #6b553a;">A journey through time</div>
                <div style="font-size: 28px; margin-top: 30px;">${stories.length} ${stories.length === 1 ? 'precious memory' : 'precious memories'}</div>
                <div style="margin-top: 50px; font-size: 34px; color: #ab7a45;">Yaadoo ka Baksa</div>
                <div style="margin-top: 20px; font-size: 18px; color: #6b5545; font-family: 'Arial', sans-serif;">${new Date().toLocaleDateString()}</div>
              </div>
              
              <!-- Decorative corner elements -->
              <div style="position: absolute; top: 10px; left: 10px; width: 40px; height: 40px; transform: rotate(-15deg);">
                <svg viewBox="0 0 24 24" fill="#6b553a">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path>
                </svg>
              </div>
              <div style="position: absolute; bottom: 10px; right: 10px; width: 30px; height: 30px; transform: rotate(15deg);">
                <svg viewBox="0 0 24 24" fill="#6b553a">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Tape effect top -->
            <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 140px; height: 30px; background: rgba(255,255,255,0.6); border-radius: 0 0 5px 5px; opacity: 0.7;"></div>
          </div>
        `;
        
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Add table of contents with scrapbook styling
      if (options.includeTOC && stories.length > 1) {
        let tocHtml = `
          <div style="height: 800px; position: relative; background-color: #e9dfc8; overflow: hidden;">
            <!-- Background texture -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.2; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2NjY2MiPjwvcmVjdD4KPC9zdmc+');">
            </div>
            
            <div style="position: relative; margin: 40px; padding: 20px; height: calc(100% - 80px); background: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(0,0,0,0.1);">
              <!-- Hand-drawn style border -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 2px solid #a57b50; border-radius: 2px; margin: 5px; pointer-events: none;"></div>
              
              <h1 style="font-size: 32px; color: #784e2b; text-align: center; margin-bottom: 30px; text-decoration: underline;">Our Memories</h1>
              
              <!-- Pin effect -->
              <div style="position: absolute; top: 20px; left: 30px; width: 20px; height: 20px; background: #a57b50; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
              
              <!-- Contents with a handwritten look -->
              <div style="position: relative; margin: 0 auto; max-width: 600px;">
        `;
        
        stories.forEach((story, index) => {
          const pageNumber = index + (options.includeCover ? 1 : 0) + (options.includeTOC ? 1 : 0);
          const storyDate = story.date ? new Date(story.date).toLocaleDateString() : '';
          
          const isEven = index % 2 === 0;
          const rotation = isEven ? '1deg' : '-1deg';
          
          tocHtml += `
            <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 15px; background: ${isEven ? '#fff3dc' : '#fff9ec'}; transform: rotate(${rotation}); box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <div style="width: 30px; height: 30px; background: #a57b50; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-family: Arial, sans-serif;">${index + 1}</div>
              <div style="flex-grow: 1;">
                <div style="font-size: 22px; margin-bottom: 5px;">${story.title || 'Untitled Memory'}</div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-family: Arial, sans-serif; color: #6b5545;">
                  <div>${storyDate}</div>
                  <div>Page ${pageNumber + 1}</div>
                </div>
              </div>
            </div>
          `;
        });
        
        tocHtml += `
              </div>
              
              <!-- Decorative elements -->
              <div style="position: absolute; bottom: 20px; right: 30px; transform: rotate(-10deg);">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#a57b50" stroke-width="0.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Coffee stain effect -->
            <div style="position: absolute; bottom: 30px; left: 80px; width: 120px; height: 120px; border-radius: 50%; background: rgba(165, 123, 80, 0.15); transform: rotate(20deg);"></div>
          </div>
        `;
        
        container.innerHTML = tocHtml;
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Add each story with vintage scrapbook styling
      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        updateDownloadProgress((i / stories.length) * 100);
        
        // Get story details
        const storyDate = story.date ? new Date(story.date).toLocaleDateString() : 'Unknown date';
        const storyLocation = story.location || '';
        const storyTags = story.tags ? story.tags.split(',').map(tag => 
          `<span style="display: inline-block; background: rgba(165, 123, 80, 0.2); padding: 8px 12px; margin: 5px; border-radius: 15px; font-size: 14px;">${tag.trim()}</span>`
        ).join('') : '';
        
        // Random rotations for scrapbook feel
        const rotation = Math.random() > 0.5 ? '1deg' : '-1deg';
        
        container.innerHTML = `
          <div style="height: 800px; position: relative; background-color: #e9dfc8; overflow: hidden;">
            <!-- Background texture -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.2; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2NjY2MiPjwvcmVjdD4KPC9zdmc+');">
            </div>
            
            <!-- Main content area -->
            <div style="position: relative; margin: 30px; padding: 25px; height: calc(100% - 60px);">
              <!-- Date tag -->
              <div style="position: absolute; top: 15px; right: 20px; transform: rotate(5deg); z-index: 2;">
                <div style="background: #fff; padding: 8px 15px; font-size: 16px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); border: 1px solid #d4be98; font-family: Arial, sans-serif;">
                  ${storyDate}
                </div>
              </div>
              
              <!-- Title card -->
              <div style="background: white; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transform: rotate(${rotation}); position: relative; margin-bottom: 30px;">
                <h2 style="font-size: 32px; color: #784e2b; text-align: center; margin-bottom: 10px;">${story.title || 'Untitled Memory'}</h2>
                
                ${storyLocation ? `
                <div style="text-align: center; margin: 15px 0; font-size: 16px; color: #6b5545; font-family: Arial, sans-serif;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#a57b50" style="vertical-align: middle; margin-right: 5px;">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"></path>
                  </svg>
                  ${storyLocation}
                </div>
                ` : ''}
                
                <!-- Tape effect -->
                <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 100px; height: 25px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.1); opacity: 0.7;"></div>
              </div>
              
              <!-- Description in a note style -->
              <div style="background: linear-gradient(to bottom, #fffdf6, #fff9ec); padding: 25px; border: 1px solid #e6d8c0; box-shadow: 0 3px 10px rgba(0,0,0,0.05); margin-bottom: 25px; position: relative; font-family: 'Arial', sans-serif;">
                <div style="font-size: 16px; line-height: 1.6; color: #5a3e1b; white-space: pre-wrap;">
                  ${story.description || 'No description provided for this memory.'}
                </div>
                
                <!-- Notebook lines effect -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-image: linear-gradient(0deg, transparent 39px, #e0cdb4 40px); background-size: 100% 40px; opacity: 0.3;"></div>
                
                <!-- Pin effect -->
                <div style="position: absolute; top: 10px; left: 10px; width: 8px; height: 8px; border-radius: 50%; background: #a57b50; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
              </div>
        `;
        
        // Add tags with vintage look
        if (storyTags) {
          container.innerHTML += `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 20px; color: #784e2b; margin-bottom: 10px; font-family: 'Dancing Script', cursive; text-align: center;">Tags</div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center;">${storyTags}</div>
            </div>
          `;
        }
        
        // Add media with scrapbook style
        if (options.includeMedia && story.media && story.media.length) {
          let mediaItems = story.media;
          let mediaTypes = {
            images: 0,
            videos: 0,
            audio: 0
          };
          
          // Count media types
          if (mediaItems && mediaItems.length > 0) {
            mediaItems.forEach(item => {
              const type = getMediaType(item.url || item.path || "");
              if (type === 'image') mediaTypes.images++;
              else if (type === 'video') mediaTypes.videos++;
              else if (type === 'audio') mediaTypes.audio++;
            });
          }
          
          // Filter media based on options
          let filteredMedia = mediaItems.filter(item => {
            const type = getMediaType(item.url || item.path || "");
            if (type === 'image' && !options.includeImages) return false;
            if (type === 'video' && !options.includeVideos) return false;
            if (type === 'audio' && !options.includeAudio) return false;
            return true;
          });
          
          // Limit images if maxImagesPerStory is set
          if (options.maxImagesPerStory !== 'all') {
            const maxImages = parseInt(options.maxImagesPerStory);
            const images = filteredMedia.filter(item => getMediaType(item.url || item.path || "") === 'image');
            const nonImages = filteredMedia.filter(item => getMediaType(item.url || item.path || "") !== 'image');
            
            if (images.length > maxImages) {
              // Keep only the specified number of images
              filteredMedia = [...images.slice(0, maxImages), ...nonImages];
            }
          }
          
          // If we have media to show after filtering
          if (filteredMedia.length > 0) {
            // Fetch actual media URLs
            const mediaWithUrls = await fetchMediaUrls(story);
            
            // Create polaroid-style gallery
            if (mediaWithUrls.length > 0) {
              container.innerHTML += `
                <div style="position: relative; margin-top: 20px;">
                  <div style="font-size: 20px; color: #784e2b; margin-bottom: 15px; font-family: 'Dancing Script', cursive; text-align: center;">Memory Gallery</div>
                  
                  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
              `;
              
              // Add polaroid-style photos
              for (let j = 0; j < Math.min(mediaWithUrls.length, 3); j++) { // Limit to 3 items for scrapbook page
                const media = mediaWithUrls[j];
                const mediaType = getMediaType(media.url || media.path || "");
                const rotation = (j % 3 === 0) ? '-3deg' : (j % 3 === 1) ? '2deg' : '0deg';
                
                if (mediaType === 'image' && options.includeImages) {
                  container.innerHTML += `
                    <div style="background: white; padding: 10px 10px 30px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transform: rotate(${rotation}); max-width: 180px; position: relative;">
                      <img src="${media.downloadUrl}" alt="Memory" style="width: 100%; height: 140px; object-fit: cover; display: block;">
                      <div style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.1); opacity: 0.7;"></div>
                    </div>
                  `;
                } else if (mediaType === 'video' && options.includeVideos) {
                  container.innerHTML += `
                    <div style="background: white; padding: 10px 10px 30px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transform: rotate(${rotation}); max-width: 180px; position: relative;">
                      <div style="width: 160px; height: 140px; display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
                        <div style="font-size: 36px;">🎬</div>
                      </div>
                      <div style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.1); opacity: 0.7;"></div>
                    </div>
                  `;
                } else if (mediaType === 'audio' && options.includeAudio) {
                  container.innerHTML += `
                    <div style="background: white; padding: 10px 10px 30px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transform: rotate(${rotation}); max-width: 180px; position: relative;">
                      <div style="width: 160px; height: 140px; display: flex; align-items: center; justify-content: center; background: #f0f0f0;">
                        <div style="font-size: 36px;">🎵</div>
                      </div>
                      <div style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.1); opacity: 0.7;"></div>
                    </div>
                  `;
                }
              }
              
              container.innerHTML += `
                  </div>
                  
                  ${mediaWithUrls.length > 3 ? `
                  <div style="text-align: center; margin-top: 15px; font-family: Arial, sans-serif; font-size: 14px; color: #6b5545;">
                    + ${mediaWithUrls.length - 3} more ${mediaWithUrls.length - 3 === 1 ? 'item' : 'items'}
                  </div>
                  ` : ''}
                </div>
              `;
            } else {
              // Fallback if URLs couldn't be fetched
              container.innerHTML += `
                <div style="margin-top: 20px; text-align: center;">
                  <div style="font-size: 20px; color: #784e2b; margin-bottom: 10px; font-family: 'Dancing Script', cursive;">Memory Gallery</div>
                  <div style="background: #f0e6d9; padding: 15px; display: inline-block; transform: rotate(-2deg); box-shadow: 3px 3px 8px rgba(0,0,0,0.1);">
                    ${filteredMedia.length} ${filteredMedia.length === 1 ? 'memory item' : 'memory items'}
                  </div>
                </div>
              `;
            }
          }
        }
        
        // Add decorative elements and page number
        container.innerHTML += `
              <!-- Decorative corner elements -->
              <div style="position: absolute; bottom: 20px; left: 20px; transform: rotate(-10deg);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#a57b50" opacity="0.5">
                  <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path>
                </svg>
              </div>
              
              <div style="position: absolute; bottom: 30px; right: 30px; transform: rotate(3deg); font-family: 'Dancing Script', cursive; font-size: 20px; color: #784e2b;">
                Page ${currentPage + 1}
              </div>
            </div>
            
            <!-- Coffee stain effect -->
            <div style="position: absolute; top: 40px; left: 20px; width: 80px; height: 80px; border-radius: 50%; background: rgba(165, 123, 80, 0.1); transform: rotate(-10deg);"></div>
          </div>
        `;
        
        await addHTMLToPDF(doc, container, currentPage++);
      }
      
      // Save the PDF with scrapbook name
      const filename = stories.length === 1 
        ? `${stories[0].title || 'Memory'} Scrapbook.pdf` 
        : 'My Memories Scrapbook.pdf';
      
      updateDownloadProgress(100, 'Preparing your scrapbook...');
      
      setTimeout(() => {
        doc.save(filename);
        hideDownloadProgress();
      }, 1000);
      
    } finally {
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  }
  
  // Show download progress
  function showDownloadProgress() {
    // Create progress container if it doesn't exist
    let progressContainer = document.querySelector('.download-progress');
    
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.className = 'download-progress';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      
      const progressText = document.createElement('div');
      progressText.className = 'progress-text';
      progressText.textContent = '0%';
      
      progressBar.appendChild(progressText);
      progressContainer.appendChild(progressBar);
      
      // Add to download actions
      const downloadActions = document.querySelector('.download-actions');
      downloadActions.insertBefore(progressContainer, downloadActions.firstChild);
    }
    
    // Show progress
    const progressBar = progressContainer.querySelector('.progress-bar');
    progressBar.style.width = '0%';
    progressContainer.style.display = 'block';
    
    // Disable buttons
    generatePreviewBtn.disabled = true;
    downloadActionBtn.disabled = true;
  }
  
  // Update download progress
  function updateDownloadProgress(percent, message) {
    const progressContainer = document.querySelector('.download-progress');
    if (!progressContainer) return;
    
    const progressBar = progressContainer.querySelector('.progress-bar');
    const progressText = progressContainer.querySelector('.progress-text');
    
    progressBar.style.width = `${percent}%`;
    
    // Custom format-specific messages
    if (!message) {
      if (selectedFormat === 'scrapbook') {
        if (percent < 25) {
          message = `Preparing your memories... ${Math.round(percent)}%`;
        } else if (percent < 50) {
          message = `Arranging photos... ${Math.round(percent)}%`;
        } else if (percent < 75) {
          message = `Adding decorations... ${Math.round(percent)}%`;
        } else {
          message = `Finalizing scrapbook... ${Math.round(percent)}%`;
        }
      } else {
        message = `${Math.round(percent)}%`;
      }
    }
    
    progressText.textContent = message;
  }
  
  // Hide download progress
  function hideDownloadProgress() {
    const progressContainer = document.querySelector('.download-progress');
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
    
    // Enable buttons
    generatePreviewBtn.disabled = false;
    downloadActionBtn.disabled = false;
  }
});