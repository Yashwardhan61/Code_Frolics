import axios from 'axios';
import { auth } from '../config/firebase';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
const baseURL = cleanApiUrl ? `${cleanApiUrl}/api` : '/api';

const api = axios.create({
    baseURL: baseURL,
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access - maybe token expired');
        }
        return Promise.reject(error);
    }
);

export default api;
