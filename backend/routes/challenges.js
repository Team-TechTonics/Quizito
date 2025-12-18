const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user's challenges
router.get('/', protect, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            $or: [{ challenger: req.user._id }, { opponent: req.user._id }]
        })
            .populate('challenger', 'username avatar')
            .populate('opponent', 'username avatar')
            .populate('quiz', 'title difficulty')
            .sort({ createdAt: -1 });

        res.json(challenges);
    } catch (error) {
        console.error('Get challenges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create challenge
router.post('/', protect, async (req, res) => {
    try {
        const { opponentId, quizId, wager = 0 } = req.body;

        if (opponentId === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot challenge yourself" });
        }

        const challenge = await Challenge.create({
            challenger: req.user._id,
            opponent: opponentId,
            quiz: quizId, // Can be null if generic
            wager
        });

        const populatedChallenge = await Challenge.findById(challenge._id)
            .populate('challenger', 'username avatar')
            .populate('opponent', 'username avatar');

        res.status(201).json({ challenge: populatedChallenge });
    } catch (error) {
        console.error('Create challenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept challenge
router.post('/:id/accept', protect, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });

        if (challenge.opponent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to accept this challenge" });
        }

        challenge.status = 'active';
        await challenge.save();

        res.json({ message: "Challenge accepted", challenge });
    } catch (error) {
        console.error('Accept challenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Decline challenge
router.post('/:id/decline', protect, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });

        if (challenge.opponent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        challenge.status = 'declined';
        await challenge.save();

        res.json({ message: "Challenge declined" });
    } catch (error) {
        console.error('Decline challenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
