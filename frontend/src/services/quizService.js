// src/services/quizService.js
import api from './api';

export const quizService = {
    /**
     * Get all quizzes with optional filters
     */
    async getQuizzes(filters = {}) {
        try {
            const response = await api.get('/quizzes', { params: filters });
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
            const response = await api.get(`/quizzes/${id}`);
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
            const response = await api.post('/quizzes', quizData);
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
            const response = await api.put(`/quizzes/${id}`, quizData);
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
            const response = await api.delete(`/quizzes/${id}`);
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
            const response = await api.post(`/quizzes/${quizId}/submit`, results);
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
            const response = await api.get(`/users/${userId}/quizzes`);
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
            const response = await api.post('/ai/generate', {
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
            const response = await api.post('/quiz/generate-from-pdf', formData, {
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
            const response = await api.post('/quiz-generation/from-audio', formData, {
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
            const response = await api.post('/sessions', sessionData);
            return response.data.session || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
