// AI helper functionality for the paternal family tree page
import { generateHeritageInsight, generateFamilyStory } from '../home/ai-utils.js';

// DOM elements
let insightButton;
let storyButton;
let aiOutputContainer;
let loadingIndicator;

// Initialize the AI helper functionality
export function initAIHelper() {
    // Get DOM elements
    insightButton = document.getElementById('ai-insight-button');
    storyButton = document.getElementById('ai-story-button');
    aiOutputContainer = document.getElementById('ai-output-container');
    loadingIndicator = document.getElementById('ai-loading-indicator');
    
    // Add event listeners
    if (insightButton) {
        insightButton.addEventListener('click', handleInsightGeneration);
    }
    
    if (storyButton) {
        storyButton.addEventListener('click', handleStoryGeneration);
    }
}

// Handle heritage insight generation
async function handleInsightGeneration() {
    try {
        showLoading();
        
        // Get the selected family member data from the UI
        const familyMember = getSelectedFamilyMember();
        
        // Generate the heritage insight
        const insight = await generateHeritageInsight(familyMember);
        
        // Display the insight
        displayOutput('Heritage Insight', insight);
    } catch (error) {
        console.error('Error generating heritage insight:', error);
        displayError('Failed to generate heritage insight. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Handle family story generation
async function handleStoryGeneration() {
    try {
        showLoading();
        
        // Get the selected family member data from the UI
        const familyMember = getSelectedFamilyMember();
        
        // Generate the family story
        const story = await generateFamilyStory(familyMember);
        
        // Display the story
        displayOutput('Family Story', story);
    } catch (error) {
        console.error('Error generating family story:', error);
        displayError('Failed to generate family story. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Helper function to get the selected family member's data from the UI
function getSelectedFamilyMember() {
    // This is a simplified example - in a real application, you would get this data
    // from form fields, selected elements, or other UI components
    
    // For now, return some default data
    return {
        name: document.querySelector('.selected-member-name')?.textContent || 'Unknown',
        birthYear: document.querySelector('.selected-member-birth-year')?.textContent || 'Unknown',
        location: document.querySelector('.selected-member-location')?.textContent || 'Unknown',
        occupation: document.querySelector('.selected-member-occupation')?.textContent || 'Unknown'
    };
}

// Display the AI output
function displayOutput(title, content) {
    if (!aiOutputContainer) return;
    
    aiOutputContainer.innerHTML = `
        <div class="ai-output">
            <h3>${title}</h3>
            <div class="ai-content">${content}</div>
        </div>
    `;
    
    aiOutputContainer.style.display = 'block';
}

// Display an error message
function displayError(message) {
    if (!aiOutputContainer) return;
    
    aiOutputContainer.innerHTML = `
        <div class="ai-error">
            <p>${message}</p>
        </div>
    `;
    
    aiOutputContainer.style.display = 'block';
}

// Show loading indicator
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    if (aiOutputContainer) {
        aiOutputContainer.style.display = 'none';
    }
}

// Hide loading indicator
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAIHelper);