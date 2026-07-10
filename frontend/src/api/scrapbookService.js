import api from './axiosConfig';

export const scrapbookService = {
    getAllScrapbooks: async () => {
        const response = await api.get('/scrapbooks');
        return response.data;
    },
    
    getScrapbookById: async (id) => {
        const response = await api.get(`/scrapbooks/${id}`);
        return response.data;
    },
    
    createScrapbook: async (scrapbookRequest) => {
        const response = await api.post('/scrapbooks', scrapbookRequest);
        return response.data;
    },
    
    updateScrapbook: async (id, scrapbookRequest) => {
        const response = await api.put(`/scrapbooks/${id}`, scrapbookRequest);
        return response.data;
    },
    
    deleteScrapbook: async (id) => {
        await api.delete(`/scrapbooks/${id}`);
    }
};
