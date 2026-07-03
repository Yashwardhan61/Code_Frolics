import api from './axiosConfig';

export const adminService = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    }
};
