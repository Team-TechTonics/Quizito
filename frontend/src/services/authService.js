// src/services/authService.js
import api from './api';

export const authService = {
    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me');
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    /**
     * Get stored user
     */
    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
