// backend/routes/adaptive.js
const express = require('express');
const router = express.Router();
const adaptiveDifficultyService = require('../services/adaptiveDifficultyService');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/adaptive/performance
 * @desc    Get user's performance insights
 * @access  Private
 */
router.get('/performance', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const insights = await adaptiveDifficultyService.getPerformanceInsights(userId);
        res.json({ success: true, performance: insights });
    } catch (error) {
        console.error('[Adaptive] Performance error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/adaptive/record-answer
 * @desc    Record user answer and update performance
 * @access  Private
 */
router.post('/record-answer', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const { questionId, isCorrect, timeTaken, difficulty } = req.body;

        const result = await adaptiveDifficultyService.recordAnswer(userId, {
            questionId,
            isCorrect,
            timeTaken,
            difficulty
        });

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('[Adaptive] Record answer error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
