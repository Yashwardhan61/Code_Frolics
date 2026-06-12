import api from './axiosConfig';

export const authService = {
    syncUser: async () => {
        const response = await api.post('/auth/sync');
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
