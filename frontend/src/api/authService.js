import api from './axiosConfig';
import axios from 'axios';

export const authService = {
    syncUser: async () => {
        const response = await api.post('/auth/sync');
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    // Public endpoint — no auth token needed
    forgotPassword: async (email) => {
        const response = await axios.post('/api/auth/forgot-password', { email });
        return response.data;
    },
    // Public endpoint — validates reset token
    validateResetToken: async (token) => {
        const response = await axios.post('/api/auth/validate-reset-token', { token });
        return response.data;
    },
    // Public endpoint — resets user password
    resetPassword: async (token, newPassword) => {
        const response = await axios.post('/api/auth/reset-password', { token, newPassword });
        return response.data;
    },
};
