import api from './axiosConfig';

export const authService = {
    syncUser: async () => {
        const response = await api.post('/auth/sync');
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    // Public endpoint — uses configured backend base URL
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    // Public endpoint — validates reset token
    validateResetToken: async (token) => {
        const response = await api.post('/auth/validate-reset-token', { token });
        return response.data;
    },
    // Public endpoint — resets user password
    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },
};
