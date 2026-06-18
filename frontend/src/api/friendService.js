import api from './axiosConfig';
export const friendService = {
    getFriends: async () => {
        const response = await api.get('/friends');
        return response.data;
    },

    getPendingInvitations: async () => {
        const response = await api.get('/friends/invitations');
        return response.data;
    },

    sendInvitation: async (email) => {
        const response = await api.post('/friends/invite', { email });
        return response.data;
    },

    acceptInvitation: async (invitationId) => {
        const response = await api.post(`/friends/accept/${invitationId}`);
        return response.data;
    },

    declineInvitation: async (invitationId) => {
        const response = await api.post(`/friends/decline/${invitationId}`);
        return response.data;
    },

    removeFriend: async (friendId) => {
        await api.delete(`/friends/${friendId}`);
    }
};
