/**
 * Gemini AI API Utility
 * This module provides functions for interacting with the Gemini AI API
 */

import { GEMINI_CONFIG } from '../config.js';

/**
 * Safely handle Gemini API calls through a backend proxy
 * @param {string} prompt - The user prompt to send to Gemini
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} The API response
 */
export async function geminiGenerateContent(prompt, options = {}) {
  try {
    // Basic request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      ...options
    };
    
    // In a production environment, we'd use a backend proxy here
    // This is a placeholder for the frontend - actual implementation should be in a server-side function
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Generate text from a prompt
 * @param {string} prompt - The user prompt
 * @returns {Promise<string>} The generated text
 */
export async function generateText(prompt) {
  const response = await geminiGenerateContent(prompt);
  return response.candidates[0].content.parts[0].text;
}

/**
 * Generate a family story based on the provided details
 * @param {Object} details - The family details to include in the story
 * @returns {Promise<string>} The generated story
 */
export async function generateFamilyStory(details) {
  const prompt = `Create a warm and engaging family story about ${details.familyMember || 'a family member'} 
    from ${details.era || 'the past'}. Include details about ${details.location || 'their hometown'} 
    and focus on ${details.theme || 'family values and traditions'}.`;
  
  return await generateText(prompt);
}

/**
 * Generate heritage insights based on family information
 * @param {Object} familyInfo - Information about the family heritage
 * @returns {Promise<Object>} Heritage insights
 */
export async function generateHeritageInsights(familyInfo) {
  const prompt = `Analyze this family information and provide insights about their cultural heritage:
    Origin: ${familyInfo.origin || 'Unknown'}
    Traditions: ${familyInfo.traditions || 'None specified'}
    Family name: ${familyInfo.familyName || 'Not provided'}
    Historical era: ${familyInfo.era || 'Modern'} 
    
    Provide 3-5 interesting facts about this heritage and cultural background.`;
  
  const text = await generateText(prompt);
  
  // Parse the response into a structured format
  return {
    insights: text.split('\n').filter(line => line.trim() !== ''),
    summary: text.substring(0, 150) + '...',
    fullText: text
  };
}