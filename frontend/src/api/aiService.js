import api from './axiosConfig';

export const aiService = {
  suggestNextWords: async (text) => {
    try {
      const response = await api.post('/ai/suggest', { text });
      return response.data.suggestion;
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      return '';
    }
  },

  enhanceDescription: async (text) => {
    try {
      const response = await api.post('/ai/enhance', { text });
      return response.data.enhanced;
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      throw error;
    }
  }
};
