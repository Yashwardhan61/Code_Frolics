import api from './axiosConfig';

export const heirloomService = {
    getAllHeirlooms: async () => {
        const response = await api.get('/heirlooms');
        return response.data;
    },
    
    getHeirloomById: async (id) => {
        const response = await api.get(`/heirlooms/${id}`);
        return response.data;
    },

    getHeirloomsByMember: async (memberId) => {
        const response = await api.get(`/heirlooms/member/${memberId}`);
        return response.data;
    },
    
    createHeirloom: async (heirloomRequest, files) => {
        const formData = new FormData();
        
        formData.append('heirloom', new Blob([JSON.stringify(heirloomRequest)], {
            type: 'application/json'
        }));
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.post('/heirlooms', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    
    updateHeirloom: async (id, heirloomRequest, files) => {
        const formData = new FormData();
        
        formData.append('heirloom', new Blob([JSON.stringify(heirloomRequest)], {
            type: 'application/json'
        }));
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        }
        
        const response = await api.put(`/heirlooms/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteHeirloom: async (id) => {
        await api.delete(`/heirlooms/${id}`);
    }
};
