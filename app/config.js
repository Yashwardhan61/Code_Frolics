// OpenAI API Configuration
export const OPENAI_CONFIG = {
    apiKey: 'your-openai-api-key-here', // Replace with your actual OpenAI API key
    endpoint: 'https://api.openai.com/v1',
    modelVersion: 'gpt-4-vision-preview' // For image analysis
};

// Gemini API Configuration
export const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY || '', // Will be loaded from environment variables
    apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    apiVersion: process.env.GEMINI_API_VERSION || 'v1beta'
};