import api from './axiosConfig';

export const storyService = {
    getAllStories: async () => {
        const response = await api.get('/stories');
        return response.data;
    },

    getMemoryStatistics: async () => {
        const response = await api.get('/memories/statistics');
        return response.data;
    },
    
    searchStories: async (params) => {
        const response = await api.get('/memories/search', { params });
        return response.data;
    },
    
    getStoryById: async (id) => {
        const response = await api.get(`/stories/${id}`);
        return response.data;
    },

    getStoriesByMember: async (memberId) => {
        const response = await api.get(`/stories/member/${memberId}`);
        return response.data;
    },
    
    createStory: async (storyRequest, files) => {
        const formData = new FormData();
        
        // Append JSON data as a blob
        formData.append('story', new Blob([JSON.stringify(storyRequest)], {
            type: 'application/json'
        }));
        
        // Append files
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.post('/stories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    updateStory: async (id, storyRequest, files) => {
        const formData = new FormData();
        
        formData.append('story', new Blob([JSON.stringify(storyRequest)], {
            type: 'application/json'
        }));
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.put(`/stories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteStory: async (id) => {
        await api.delete(`/stories/${id}`);
    }
};
