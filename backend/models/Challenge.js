const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    challenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: false // Optional if we allow random quiz generation
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'declined', 'expired'],
        default: 'pending'
    },
    wager: {
        type: Number,
        default: 0
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    results: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        completedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Expire after 24 hours
    }
});

module.exports = mongoose.model('Challenge', challengeSchema);
