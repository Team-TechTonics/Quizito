const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User'); // Assuming User model exists
const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');

// Get all classes for the current user (teacher or student)
router.get('/', auth, async (req, res) => {
    try {
        // If teacher, find created classes. If student, find enrolled classes.
        // For now, let's return all classes the user is part of or created.
        // Simple logic: match teacher OR students array
        const classes = await Class.find({
            $or: [
                { teacher: req.user.id },
                { 'students.student': req.user.id }
            ]
        }).populate('teacher', 'username');
        res.json({ classes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all assignments for the current student
router.get('/student/assignments', auth, async (req, res) => {
    try {
        // Find classes where user is student
        const classes = await Class.find({ 'students.student': req.user.id });
        const classIds = classes.map(c => c._id);

        // Find assignments for these classes
        const assignments = await Assignment.find({
            classId: { $in: classIds },
            status: 'active' // Optional: filter by status
        }).populate('quizId', 'title').populate('classId', 'name');

        res.json({ assignments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a class
router.post('/', auth, async (req, res) => {
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newClass = new Class({
            ...req.body,
            teacher: req.user.id,
            code
        });
        await newClass.save();
        res.status(201).json({ class: newClass });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get single class students
router.get('/:id/students', auth, async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id).populate('students.student', 'username email');
        if (!cls) return res.status(404).json({ message: 'Class not found' });
        // Format for frontend
        const students = cls.students.map(s => ({
            id: s.student._id,
            name: s.student.username,
            email: s.student.email,
            joinedAt: s.joinedAt
        }));
        res.json({ students });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Invite Student (Mock email for now, just add if user exists)
router.post('/:id/invite', auth, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const cls = await Class.findById(req.params.id);
        if (cls.students.some(s => s.student.toString() === user.id)) {
            return res.status(400).json({ message: 'User already in class' });
        }

        cls.students.push({ student: user.id });
        await cls.save();
        res.json({ message: 'Student added' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ASSIGNMENTS ROUTES NESTED HERE OR SEPARATE?
// Let's keep them here for now as they are class-related usually, or separate file is fine.
// Using separate file for cleaner structure usually better, but frontend calls /classes/:id/assignments
// So we can handle that here.

router.get('/:id/assignments', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({ classId: req.params.id }).populate('quizId', 'title');
        res.json({ assignments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/assignments', auth, async (req, res) => {
    try {
        const assignment = new Assignment({
            ...req.body,
            classId: req.params.id,
            assignedBy: req.user.id
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete class
router.delete('/:id', auth, async (req, res) => {
    try {
        const cls = await Class.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
        if (!cls) return res.status(404).json({ message: 'Class not found or unauthorized' });
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Join Class (Student side)
router.post('/join', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const cls = await Class.findOne({ code });
        if (!cls) return res.status(404).json({ message: 'Invalid class code' });

        if (cls.students.some(s => s.student.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Already joined this class' });
        }

        cls.students.push({ student: req.user.id });
        await cls.save();
        res.json({ message: 'Joined class successfully', classId: cls._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
