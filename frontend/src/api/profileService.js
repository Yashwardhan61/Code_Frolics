import api from './axiosConfig';

export const profileService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },
    
    updateProfile: async (profileRequest) => {
        const response = await api.put('/profile', profileRequest);
        return response.data;
    },
    
    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
