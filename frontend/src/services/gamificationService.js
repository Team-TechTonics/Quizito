// src/services/gamificationService.js
import api from './api';

export const gamificationService = {
    /**
     * Get user achievements
     */
    async getUserAchievements(userId) {
        try {
            const response = await api.get(`/users/${userId}/achievements`);
            return response.data.achievements || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get leaderboard
     */
    async getLeaderboard(type = 'global', period = 'all') {
        try {
            const response = await api.get('/leaderboard', {
                params: { type, period }
            });
            return response.data.leaderboard || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Unlock achievement
     */
    async unlockAchievement(achievementId) {
        try {
            const response = await api.post(`/achievements/${achievementId}/unlock`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user XP and level info
     */
    async getUserLevel(userId) {
        try {
            const response = await api.get(`/users/${userId}/level`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add XP to user
     */
    async addXP(userId, xp, reason) {
        try {
            const response = await api.post(`/users/${userId}/xp`, { xp, reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
