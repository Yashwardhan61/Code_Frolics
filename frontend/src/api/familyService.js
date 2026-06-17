import api from './axiosConfig';

export const familyService = {
    getTree: async (type) => {
        const response = await api.get(`/family-tree/${type}`);
        return response.data;
    },

    addMember: async (type, memberRequest) => {
        const response = await api.post(`/family-tree/${type}`, memberRequest);
        return response.data;
    },

    updateMember: async (type, id, memberRequest) => {
        const response = await api.put(`/family-tree/${type}/${id}`, memberRequest);
        return response.data;
    },

    deleteMember: async (type, id) => {
        await api.delete(`/family-tree/${type}/${id}`);
    },

    uploadPhoto: async (type, id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/family-tree/${type}/${id}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
