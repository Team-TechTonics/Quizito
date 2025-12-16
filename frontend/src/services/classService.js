// src/services/classService.js
import api from './api';

export const classService = {
    /**
     * Get all classes for the current educator
     */
    async getClasses() {
        try {
            const response = await api.get('/classes');
            return response.data.classes || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get a specific class by ID
     */
    async getClass(classId) {
        try {
            const response = await api.get(`/classes/${classId}`);
            return response.data.class || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create a new class
     */
    async createClass(classData) {
        try {
            const response = await api.post('/classes', classData);
            return response.data.class || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update a class
     */
    async updateClass(classId, classData) {
        try {
            const response = await api.put(`/classes/${classId}`, classData);
            return response.data.class || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete a class
     */
    async deleteClass(classId) {
        try {
            const response = await api.delete(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get students in a class
     */
    async getClassStudents(classId) {
        try {
            const response = await api.get(`/classes/${classId}/students`);
            return response.data.students || response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Invite student to class
     */
    async inviteStudent(classId, email) {
        try {
            const response = await api.post(`/classes/${classId}/invite`, { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove student from class
     */
    async removeStudent(classId, studentId) {
        try {
            const response = await api.delete(`/classes/${classId}/students/${studentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Assign a quiz to a class
     */
    async assignQuiz(classId, assignmentData) {
        try {
            const response = await api.post(`/classes/${classId}/assignments`, assignmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get assignments for a class
     */
    async getClassAssignments(classId) {
        try {
            const response = await api.get(`/classes/${classId}/assignments`);
            return response.data.assignments || response.data;
        } catch (error) {
            // Return empty array if endpoint not fully ready to avoid breaking UI
            console.warn("Failed to fetch assignments (endpoint might be missing)", error);
            return [];
        }
    },

    /**
     * Get all assignments for the current student
     */
    async getStudentAssignments() {
        try {
            const response = await api.get('/classes/student/assignments');
            return response.data.assignments || response.data;
        } catch (error) {
            console.warn("Failed to fetch student assignments", error);
            return [];
        }
    }
};
