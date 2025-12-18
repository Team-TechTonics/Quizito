// src/services/quizService.js
import api from './api';

export const quizService = {
    /**
     * Get all quizzes with optional filters
     */
    async getQuizzes(filters = {}) {
        try {
            const response = await api.get('/api/quizzes', { params: filters });
            return response.data.quizzes || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get quiz by ID
     */
    async getQuizById(id) {
        try {
            const response = await api.get(`/api/quizzes/${id}`);
            return response.data.quiz || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create new quiz
     */
    async createQuiz(quizData) {
        try {
            const response = await api.post('/api/quizzes', quizData);
            return response.data.quiz || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update quiz
     */
    async updateQuiz(id, quizData) {
        try {
            const response = await api.put(`/api/quizzes/${id}`, quizData);
            return response.data.quiz || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete quiz
     */
    async deleteQuiz(id) {
        try {
            const response = await api.delete(`/api/quizzes/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Submit quiz results
     */
    async submitQuizResults(quizId, results) {
        try {
            const response = await api.post(`/api/quizzes/${quizId}/submit`, results);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user's quiz history
     */
    async getUserQuizzes(userId) {
        try {
            const response = await api.get(`/api/users/${userId}/quizzes`);
            return response.data.quizzes || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate quiz from topic using AI
     */
    async generateAIQuiz(topic, options = {}) {
        try {
            const response = await api.post('/api/ai/generate', {
                type: "topic",
                content: topic,
                options
            });
            return response.data.quiz || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate quiz from PDF upload
     */
    async generateFromPDF(formData, onUploadProgress) {
        try {
            const response = await api.post('/api/quiz/generate-from-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress
            });
            return response.data.quiz || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate quiz from Audio upload
     */
    async generateFromAudio(formData, onUploadProgress) {
        try {
            const response = await api.post('/api/quiz-generation/from-audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress
            });
            return response.data.quiz || response.data; // Handles both {quiz: [...]} and {quiz: {questions: ...}}
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create a new host session
     */
    async createSession(sessionData) {
        try {
            const response = await api.post('/api/sessions', sessionData);
            return response.data.session || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user analytics
     */
    async getUserAnalytics(userId, period = '30d') {
        try {
            const response = await api.get(`/api/analytics/user/${userId}`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
