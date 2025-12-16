// src/services/socialService.js
import api from './api';

export const socialService = {
    // ============ Friends ============

    /**
     * Get user's friends list
     */
    async getFriends() {
        try {
            const response = await api.get('/friends');
            return response.data.friends || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Send friend request
     */
    async sendFriendRequest(userId, message = '') {
        try {
            const response = await api.post('/friends/request', { userId, message });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Accept friend request
     */
    async acceptFriendRequest(requestId) {
        try {
            const response = await api.post(`/friends/accept/${requestId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Decline friend request
     */
    async declineFriendRequest(requestId) {
        try {
            const response = await api.post(`/friends/decline/${requestId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove friend
     */
    async removeFriend(friendId) {
        try {
            const response = await api.delete(`/friends/${friendId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get friend requests
     */
    async getFriendRequests() {
        try {
            const response = await api.get('/friends/requests');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get suggested friends
     */
    async getSuggestedFriends() {
        try {
            const response = await api.get('/friends/suggestions');
            return response.data.suggestions || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ============ Challenges ============

    /**
     * Get user's challenges
     */
    async getChallenges() {
        try {
            const response = await api.get('/challenges');
            return response.data.challenges || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create challenge
     */
    async createChallenge(challengeData) {
        try {
            const response = await api.post('/challenges', challengeData);
            return response.data.challenge || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Accept challenge
     */
    async acceptChallenge(challengeId) {
        try {
            const response = await api.post(`/challenges/${challengeId}/accept`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Decline challenge
     */
    async declineChallenge(challengeId) {
        try {
            const response = await api.post(`/challenges/${challengeId}/decline`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Complete challenge
     */
    async completeChallenge(challengeId, results) {
        try {
            const response = await api.post(`/challenges/${challengeId}/complete`, results);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ============ Activity Feed ============

    /**
     * Get activity feed
     */
    async getActivityFeed(limit = 10) {
        try {
            const response = await api.get('/activity', { params: { limit } });
            return response.data.activities || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Like activity
     */
    async likeActivity(activityId) {
        try {
            const response = await api.post(`/activity/${activityId}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Unlike activity
     */
    async unlikeActivity(activityId) {
        try {
            const response = await api.delete(`/activity/${activityId}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Comment on activity
     */
    async commentOnActivity(activityId, comment) {
        try {
            const response = await api.post(`/activity/${activityId}/comment`, { comment });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get comments for activity
     */
    async getActivityComments(activityId) {
        try {
            const response = await api.get(`/activity/${activityId}/comments`);
            return response.data.comments || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Search users to add as friends
     */
    async searchUsers(query) {
        try {
            const response = await api.get('/users/search', { params: { query } });
            return response.data.users || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
