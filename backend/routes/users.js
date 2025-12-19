const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const authenticate = require('../middleware/auth');


// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password,
            role: 'student' // Default role
        });

        // Password hashing is handled by User model pre-save hook
        // Do NOT hash here manually or it will be hashed twice!

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    console.error("JWT Sign Error:", err);
                    return res.status(500).json({ msg: 'Token generation failed' });
                }
                res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/users/:userId/quiz-results
// @desc    Get user's quiz history and stats
// @access  Private
router.get('/:userId/quiz-results', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user can only access their own results (unless admin)
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const results = await QuizResult.find({ userId })
            .populate('quizId', 'title category difficulty')
            .sort({ completedAt: -1 })
            .limit(50); // Last 50 quizzes

        // Calculate aggregate stats
        const stats = {
            totalQuizzes: results.length,
            averageScore: results.length > 0
                ? results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length
                : 0,
            totalCorrect: results.reduce((sum, r) => sum + (r.correctAnswers || 0), 0),
            totalQuestions: results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0),
            bestScore: results.length > 0
                ? Math.max(...results.map(r => r.percentage || 0))
                : 0,
            recentQuizzes: results.slice(0, 5),
        };

        res.json({ results, stats });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
});

// @route   GET api/users/quiz-results/:resultId
// @desc    Get specific quiz result details
// @access  Private
router.get('/quiz-results/:resultId', authenticate, async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.resultId)
            .populate('quizId')
            .populate('userId', 'username email avatar');

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Verify access
        if (result.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        res.status(500).json({ error: 'Failed to fetch quiz result' });
    }
});

module.exports = router;
