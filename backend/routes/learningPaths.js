const express = require('express');
const router = express.Router();
const LearningPath = require('../models/LearningPath');
const auth = require('../middleware/auth'); // Assuming auth middleware exists

// Get all learning paths (public or active)
router.get('/', async (req, res) => {
    try {
        const paths = await LearningPath.find({ isPublic: true }).populate('creator', 'username');
        res.json(paths);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific learning path
router.get('/:id', async (req, res) => {
    try {
        const path = await LearningPath.findById(req.params.id)
            .populate('creator', 'username')
            .populate('modules.steps.contentId', 'title');
        if (!path) return res.status(404).json({ message: 'Path not found' });
        res.json(path);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new learning path (Educator only)
router.post('/', auth, async (req, res) => {
    // Check role if needed
    try {
        const path = new LearningPath({
            ...req.body,
            creator: req.user.id
        });
        const newPath = await path.save();
        res.status(201).json(newPath);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Enroll in a path
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const path = await LearningPath.findById(req.params.id);
        if (!path) return res.status(404).json({ message: 'Path not found' });

        if (!path.studentsEnrolled.includes(req.user.id)) {
            path.studentsEnrolled.push(req.user.id);
            await path.save();
        }
        res.json({ message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
