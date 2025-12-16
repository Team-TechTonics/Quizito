import api from './api';

export const learningPathService = {
    // Get all public learning paths
    async getAllPaths() {
        try {
            const response = await api.get('/learning-paths');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get a specific path by ID
    async getPathById(id) {
        try {
            const response = await api.get(`/learning-paths/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Enroll in a path
    async enroll(id) {
        try {
            const response = await api.post(`/learning-paths/${id}/enroll`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create a new path (educators)
    async createPath(pathData) {
        try {
            const response = await api.post('/learning-paths', pathData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update progress (logic can be complex, for now simple placeholder)
    async updateProgress(pathId, moduleId, stepId, status) {
        // This would likely go to a dedicated progress endpoint or update user profile
        // For now, let's assume a generic sync or handled via quiz completion events
        console.log('Progress update placeholder', { pathId, moduleId, stepId, status });
    }
};
