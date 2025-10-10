/**
 * Family Tree AI Helper
 * This module adds AI-powered features to the family tree
 */

import { generateHeritageInsights, generateFamilyStory } from './ai-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get reference to relevant elements
  const aiInsightsBtn = document.getElementById('aiInsightsBtn');
  const aiStoryBtn = document.getElementById('aiStoryBtn');
  
  // Add event listeners if buttons exist
  if (aiInsightsBtn) {
    aiInsightsBtn.addEventListener('click', generateInsightsForSelectedMember);
  }
  
  if (aiStoryBtn) {
    aiStoryBtn.addEventListener('click', generateStoryForSelectedMember);
  }
  
  /**
   * Generate AI insights for the currently selected family member
   */
  async function generateInsightsForSelectedMember() {
    try {
      // Show loading state
      aiInsightsBtn.disabled = true;
      aiInsightsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating insights...';
      
      // Get the selected family member data
      const selectedMember = getSelectedFamilyMember();
      
      if (!selectedMember) {
        showToast('Please select a family member first', 'error');
        return;
      }
      
      // Gather context data for the API
      const familyInfo = {
        familyName: selectedMember.name.split(' ').pop(), // Last name
        origin: selectedMember.birthPlace || 'Unknown',
        era: selectedMember.birthDate ? 
          new Date(selectedMember.birthDate).getFullYear().toString() : 'Unknown',
        traditions: getKnownTraditions(selectedMember)
      };
      
      // Call the AI API through our utility
      const insights = await generateHeritageInsights(familyInfo);
      
      // Display the insights in a modal
      showInsightsModal(selectedMember, insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      showToast('Failed to generate insights. Please try again later.', 'error');
    } finally {
      // Reset button state
      aiInsightsBtn.disabled = false;
      aiInsightsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> AI Insights';
    }
  }
  
  /**
   * Generate a family story for the currently selected member
   */
  async function generateStoryForSelectedMember() {
    try {
      // Show loading state
      aiStoryBtn.disabled = true;
      aiStoryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Crafting story...';
      
      // Get the selected family member data
      const selectedMember = getSelectedFamilyMember();
      
      if (!selectedMember) {
        showToast('Please select a family member first', 'error');
        return;
      }
      
      // Gather context data for the API
      const details = {
        familyMember: selectedMember.name,
        era: selectedMember.birthDate ? 
          `around ${new Date(selectedMember.birthDate).getFullYear()}` : 'the past',
        location: selectedMember.birthPlace || 'their hometown',
        theme: selectedMember.bio ? getThemeFromBio(selectedMember.bio) : 'family values and traditions'
      };
      
      // Call the AI API through our utility
      const story = await generateFamilyStory(details);
      
      // Display the story in a modal
      showStoryModal(selectedMember, story);
    } catch (error) {
      console.error('Error generating story:', error);
      showToast('Failed to generate story. Please try again later.', 'error');
    } finally {
      // Reset button state
      aiStoryBtn.disabled = false;
      aiStoryBtn.innerHTML = '<i class="fas fa-book-open"></i> Generate Story';
    }
  }
  
  /**
   * Helper function to get the currently selected family member
   * This should be adapted to work with your app's state management
   */
  function getSelectedFamilyMember() {
    // This is a placeholder - replace with your actual implementation
    // to get the selected family member data from your app
    return window.selectedMember || null;
  }
  
  /**
   * Extract known traditions from member bio
   */
  function getKnownTraditions(member) {
    // This is a placeholder - you could use more sophisticated logic here
    if (!member.bio) return 'None specified';
    
    // Simple keyword search for tradition-related words
    const traditionKeywords = ['tradition', 'custom', 'celebration', 'ritual', 'holiday', 'festival'];
    const bioLower = member.bio.toLowerCase();
    
    for (const keyword of traditionKeywords) {
      if (bioLower.includes(keyword)) {
        // Extract the sentence containing the keyword
        const sentences = member.bio.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(keyword)) {
            return sentence.trim();
          }
        }
      }
    }
    
    return 'None specified';
  }
  
  /**
   * Extract theme from bio text
   */
  function getThemeFromBio(bio) {
    // This is a placeholder - you could use more sophisticated logic here
    const themeKeywords = {
      'work': 'career and professional achievements',
      'job': 'career and professional achievements',
      'career': 'career and professional achievements',
      'education': 'education and learning',
      'school': 'education and learning',
      'study': 'education and learning',
      'child': 'family and childhood',
      'family': 'family and childhood',
      'war': 'wartime experiences and resilience',
      'military': 'military service and duty',
      'travel': 'travel and adventures',
      'adventure': 'travel and adventures',
      'religion': 'faith and religious practices',
      'faith': 'faith and religious practices',
      'tradition': 'traditions and cultural heritage',
      'heritage': 'traditions and cultural heritage'
    };
    
    const bioLower = bio.toLowerCase();
    
    for (const [keyword, theme] of Object.entries(themeKeywords)) {
      if (bioLower.includes(keyword)) {
        return theme;
      }
    }
    
    return 'family values and traditions';
  }
  
  /**
   * Show insights modal with the generated content
   */
  function showInsightsModal(member, insights) {
    // Create modal content
    const modalHTML = `
      <div class="modal-header">
        <h2><i class="fas fa-lightbulb"></i> Heritage Insights: ${member.name}</h2>
        <button class="close-modal" aria-label="Close modal">&times;</button>
      </div>
      
      <div class="heritage-insights">
        <div class="heritage-summary">
          <p>${insights.summary}</p>
        </div>
        
        <h3>Cultural & Historical Insights</h3>
        <ul class="insights-list">
          ${insights.insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
        
        <div class="insights-footer">
          <p class="insights-disclaimer">
            <i class="fas fa-info-circle"></i> 
            These insights are AI-generated based on available information and may not be historically accurate.
            Always verify important historical details through proper research.
          </p>
        </div>
      </div>
    `;
    
    // Show the modal
    showModal('aiInsightsModal', modalHTML);
  }
  
  /**
   * Show story modal with the generated story
   */
  function showStoryModal(member, story) {
    // Create modal content
    const modalHTML = `
      <div class="modal-header">
        <h2><i class="fas fa-book-open"></i> Family Story: ${member.name}</h2>
        <button class="close-modal" aria-label="Close modal">&times;</button>
      </div>
      
      <div class="family-story">
        <div class="story-content">
          ${story.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
        
        <div class="story-footer">
          <p class="story-disclaimer">
            <i class="fas fa-info-circle"></i> 
            This is an AI-generated creative story based on the available information about ${member.name}.
            While inspired by real details, the narrative elements may be fictional.
          </p>
          
          <div class="story-actions">
            <button id="saveStoryBtn" class="action-btn secondary">
              <i class="fas fa-save"></i> Save to Member Profile
            </button>
            <button id="downloadStoryBtn" class="action-btn secondary">
              <i class="fas fa-download"></i> Download as PDF
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Show the modal
    const modalId = showModal('aiStoryModal', modalHTML);
    
    // Add event listeners for the action buttons
    document.getElementById('saveStoryBtn').addEventListener('click', () => {
      saveStoryToProfile(member.id, story);
    });
    
    document.getElementById('downloadStoryBtn').addEventListener('click', () => {
      downloadStoryAsPdf(member.name, story);
    });
  }
  
  /**
   * Generic function to show a modal with dynamic content
   */
  function showModal(id, content) {
    // Check if modal already exists
    let modal = document.getElementById(id);
    
    if (!modal) {
      // Create new modal element
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;
    
    // Clear and append
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    
    // Show the modal
    modal.classList.remove('hidden');
    
    // Add event listener to close button
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
    
    // Add event listener to close on outside click
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
    
    return id;
  }
  
  /**
   * Save story to member profile
   */
  function saveStoryToProfile(memberId, story) {
    // This is a placeholder - implement based on your data storage
    try {
      // Example implementation with Firebase
      // const db = firebase.database();
      // const userRef = db.ref(`users/${currentUserSafeEmail}/familyTree/${memberId}`);
      // userRef.update({
      //   aiGeneratedStory: story,
      //   storyGeneratedAt: Date.now()
      // });
      
      showToast('Story saved to profile!', 'success');
    } catch (error) {
      console.error('Error saving story:', error);
      showToast('Failed to save story.', 'error');
    }
  }
  
  /**
   * Download story as PDF
   */
  function downloadStoryAsPdf(memberName, story) {
    // This is a placeholder - implement PDF generation
    try {
      // Example implementation with jsPDF
      // const { jsPDF } = window.jspdf;
      // const doc = new jsPDF();
      // doc.setFontSize(16);
      // doc.text(`Family Story: ${memberName}`, 20, 20);
      // doc.setFontSize(12);
      // doc.text(story, 20, 30);
      // doc.save(`Family_Story_${memberName.replace(/\s+/g, '_')}.pdf`);
      
      showToast('PDF download started!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF.', 'error');
    }
  }
  
  /**
   * Show toast notification
   */
  function showToast(message, type = 'success') {
    // Check if there's an existing toast container
    let container = document.getElementById('toastContainer');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'info') icon = 'info-circle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    // Add to container
    container.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
});