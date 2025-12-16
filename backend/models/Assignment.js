const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    settings: {
        attempts: { type: Number, default: 1 },
        timeLimit: Number,
        showResults: { type: Boolean, default: true }
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'scheduled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to quickly find assignments for a class
assignmentSchema.index({ classId: 1, currentDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
