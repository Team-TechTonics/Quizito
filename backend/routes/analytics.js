// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/analytics/stats
 * @desc    Get platform statistics
 * @access  Private (Admin recommended)
 */
router.get('/stats', authenticate, async (req, res) => {
    try {
        const { timeRange = 'week' } = req.query;
        const stats = await analyticsService.getPlatformStats(timeRange);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('[Analytics] Stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/analytics/activity
 * @desc    Get user activity data for charts
 * @access  Private (Admin recommended)
 */
router.get('/activity', authenticate, async (req, res) => {
    try {
        const { timeRange = 'week' } = req.query;
        const activity = await analyticsService.getUserActivity(timeRange);
        res.json({ success: true, activity });
    } catch (error) {
        console.error('[Analytics] Activity error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/analytics/categories
 * @desc    Get category distribution
 * @access  Private (Admin recommended)
 */
router.get('/categories', authenticate, async (req, res) => {
    try {
        const categories = await analyticsService.getCategoryDistribution();
        res.json({ success: true, categories });
    } catch (error) {
        console.error('[Analytics] Categories error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/analytics/recent-quizzes
 * @desc    Get recent quizzes with participant counts
 * @access  Private (Admin recommended)
 */
router.get('/recent-quizzes', authenticate, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const quizzes = await analyticsService.getRecentQuizzes(parseInt(limit));
        res.json({ success: true, quizzes });
    } catch (error) {
        console.error('[Analytics] Recent quizzes error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
