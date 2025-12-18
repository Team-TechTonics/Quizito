const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @route   POST api/quizzes
// @desc    Create a quiz
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newQuiz = new Quiz({
            ...req.body,
            user: req.user.id,
            creator: req.user.id, // Support legacy schema
            createdBy: req.user.id // Support legacy schema
        });

        const quiz = await newQuiz.save();
        res.json(quiz);
    } catch (err) {
        console.error("Quiz Create Error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
            validation: err.errors
        });
    }
});

// @route   GET api/quizzes
// @desc    Get all quizzes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ date: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/quizzes/my
// @desc    Get current user's quizzes
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find({
            $or: [{ user: req.user.id }, { creator: req.user.id }, { createdBy: req.user.id }]
        }).sort({ date: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        // Check user
        if (quiz.user.toString() !== req.user.id &&
            quiz.creator?.toString() !== req.user.id &&
            quiz.createdBy?.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await quiz.deleteOne();

        res.json({ msg: 'Quiz removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
