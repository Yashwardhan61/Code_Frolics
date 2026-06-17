import api from './axiosConfig';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    },

    markAsRead: async (id) => {
        await api.put(`/notifications/${id}/read`);
    },

    deleteNotification: async (id) => {
        await api.delete(`/notifications/${id}`);
    }
};
