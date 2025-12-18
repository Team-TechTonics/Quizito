const mongoose = require('mongoose');

// Quiz Result Model for Analytics
const quizResultSchema = new mongoose.Schema({
    // Basic Information
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        index: true,
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // Performance Metrics
    score: { type: Number, default: 0, index: true },
    maxScore: Number,
    percentage: { type: Number, default: 0, index: true },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeSpent: Number,
    averageTimePerQuestion: Number,
    fastestAnswer: Number,
    slowestAnswer: Number,

    // Timing
    startedAt: { type: Date, index: true },
    completedAt: { type: Date, index: true },
    duration: Number,

    // Rankings
    rank: Number,
    totalParticipants: Number,
    percentile: Number,

    // Detailed Analysis
    questionBreakdown: [{
        questionIndex: Number,
        questionId: mongoose.Schema.Types.ObjectId,
        question: String,
        type: String,
        difficulty: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number,
        points: Number,
        maxPoints: Number,
        options: [{
            text: String,
            isCorrect: Boolean,
            selected: Boolean,
        }],
        explanation: String,
        hintUsed: Boolean,
        powerupUsed: String,
    }],

    categoryBreakdown: [{
        category: String,
        correct: Number,
        total: Number,
        accuracy: Number,
        averageTime: Number,
    }],

    difficultyBreakdown: [{
        difficulty: String,
        correct: Number,
        total: Number,
        accuracy: Number,
        averageTime: Number,
    }],

    // Skill Analysis
    skills: [{
        name: String,
        level: Number,
        confidence: Number,
        questions: Number,
        correct: Number,
    }],

    // AI Analysis
    aiAnalysis: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
        estimatedLevel: String,
        nextTopics: [String],
        studyPlan: [{
            topic: String,
            priority: Number,
            resources: [{
                title: String,
                url: String,
                type: String,
            }],
        }],
        confidenceScore: Number,
    },

    // Comparison
    comparedToAverage: {
        score: Number,
        accuracy: Number,
        speed: Number,
        percentile: Number,
    },

    // Feedback
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        difficulty: String,
        comment: String,
        suggestions: String,
        wouldRetake: Boolean,
        submittedAt: Date,
    },

    // Session Context
    sessionType: {
        type: String,
        enum: ["solo", "multiplayer", "practice", "exam"],
        default: "solo",
    },
    mode: {
        type: String,
        enum: ["timed", "untimed", "survival", "marathon"],
        default: "timed",
    },

    // Device and Environment
    deviceInfo: {
        platform: String,
        browser: String,
        screenSize: String,
        connectionType: String,
    },

    // Proctoring (for exams)
    proctoring: {
        enabled: Boolean,
        warnings: [{
            type: String,
            timestamp: Date,
            severity: String,
        }],
        faceDetected: Boolean,
        multipleFaces: Boolean,
        screenShareDetected: Boolean,
        tabSwitches: Number,
        averageAttention: Number,
    },

    // Certificates and Awards
    certificate: {
        issued: Boolean,
        certificateId: String,
        issuedAt: Date,
        downloadUrl: String,
        metadata: Map,
    },

    awards: [{
        type: String,
        name: String,
        description: String,
        icon: String,
        achievedAt: Date,
    }],

    // Status
    status: {
        type: String,
        enum: ["in-progress", "completed", "abandoned", "flagged", "under-review"],
        default: "completed",
    },
    flaggedReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: String,

    // Versioning
    quizVersion: Number,

    // Metadata
    metadata: {
        ipAddress: String,
        userAgent: String,
        location: {
            country: String,
            region: String,
            city: String,
        },
        referrer: String,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Indexes for analytics queries
quizResultSchema.index({ userId: 1, completedAt: -1 });
quizResultSchema.index({ quizId: 1, score: -1 });
quizResultSchema.index({ completedAt: -1 });
quizResultSchema.index({ percentage: -1 });

module.exports = mongoose.model("QuizResult", quizResultSchema);
