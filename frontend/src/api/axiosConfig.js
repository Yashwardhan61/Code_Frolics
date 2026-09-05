import axios from 'axios';
import { auth } from '../config/firebase';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
const baseURL = cleanApiUrl ? `${cleanApiUrl}/api` : '/api';

const api = axios.create({
    baseURL: baseURL,
});

// Helper to wait for Firebase to restore the auth user from IndexedDB/localStorage
let authReadyPromise = null;
const getValidUser = async () => {
    if (auth.currentUser) return auth.currentUser;

    if (!authReadyPromise) {
        if (typeof auth.authStateReady === 'function') {
            authReadyPromise = auth.authStateReady().then(() => auth.currentUser);
        } else {
            authReadyPromise = new Promise((resolve) => {
                const unsubscribe = auth.onAuthStateChanged((u) => {
                    unsubscribe();
                    resolve(u);
                });
            });
        }
    }
    return await authReadyPromise;
};

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        const user = await getValidUser();
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
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            const user = auth.currentUser;
            if (user) {
                try {
                    const freshToken = await user.getIdToken(true);
                    originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                    return api(originalRequest);
                } catch (refreshErr) {
                    console.error('Failed to refresh Firebase token', refreshErr);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
