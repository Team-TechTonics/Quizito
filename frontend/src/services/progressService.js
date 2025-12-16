// src/services/progressService.js
import api from './api';

export const progressService = {
    /**
     * Get student progress data
     */
    async getStudentProgress(userId) {
        try {
            const response = await api.get(`/users/${userId}/progress`);
            return response.data.progress || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get educator analytics for a class
     */
    async getEducatorAnalytics(classId) {
        try {
            const response = await api.get(`/classes/${classId}/analytics`);
            return response.data.analytics || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user performance by subject
     */
    async getPerformanceBySubject(userId) {
        try {
            const response = await api.get(`/users/${userId}/performance/subjects`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user's score history
     */
    async getScoreHistory(userId, timeRange = 'month') {
        try {
            const response = await api.get(`/users/${userId}/scores`, {
                params: { timeRange }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
