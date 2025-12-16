const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modules: [{
        title: { type: String, required: true },
        description: String,
        steps: [{
            type: {
                type: String,
                enum: ['quiz', 'video', 'article'],
                default: 'quiz'
            },
            contentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz' // Can be dynamic based on type in future
            },
            title: String,
            isLocked: { type: Boolean, default: true }
        }]
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
