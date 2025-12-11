// backend/models/UserPerformance.js
const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Overall stats
    totalQuestionsAnswered: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 }, // 0-100
    currentDifficultyLevel: { type: Number, default: 0.5 }, // 0-1 scale

    // Recent performance (last 10 questions)
    recentPerformance: [{
        questionId: mongoose.Schema.Types.ObjectId,
        isCorrect: Boolean,
        timeTaken: Number,
        difficulty: Number,
        timestamp: { type: Date, default: Date.now }
    }],

    updatedAt: { type: Date, default: Date.now }
});

// Record answer and update performance
userPerformanceSchema.methods.recordAnswer = function (questionData) {
    const { isCorrect, timeTaken, difficulty, questionId } = questionData;

    // Update totals
    this.totalQuestionsAnswered++;
    if (isCorrect) this.totalCorrectAnswers++;

    // Update averages
    this.averageAccuracy = (this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100;

    // Update recent performance
    this.recentPerformance.push({
        questionId,
        isCorrect,
        timeTaken,
        difficulty,
        timestamp: new Date()
    });

    // Keep only last 10
    if (this.recentPerformance.length > 10) {
        this.recentPerformance.shift();
    }

    // Adjust difficulty based on recent performance
    this.adjustDifficulty();

    this.updatedAt = new Date();
};

// Adjust difficulty based on recent performance
userPerformanceSchema.methods.adjustDifficulty = function () {
    if (this.recentPerformance.length < 3) return;

    const recentAccuracy = this.recentPerformance.filter(p => p.isCorrect).length / this.recentPerformance.length;

    // If doing very well (80%+), increase difficulty
    if (recentAccuracy >= 0.8) {
        this.currentDifficultyLevel = Math.min(1.0, this.currentDifficultyLevel + 0.1);
    }
    // If struggling (40% or less), decrease difficulty
    else if (recentAccuracy <= 0.4) {
        this.currentDifficultyLevel = Math.max(0.0, this.currentDifficultyLevel - 0.1);
    }
};

module.exports = mongoose.model('UserPerformance', userPerformanceSchema);
