const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    // Basic Information
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true,
    },
    name: String,
    description: String,
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true,
    },

    // Host Information
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    coHosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Game Settings
    settings: {
        maxPlayers: { type: Number, default: 100, min: 1, max: 1000 },
        questionTime: { type: Number, default: 30, min: 5, max: 300 },
        showLeaderboard: { type: Boolean, default: true },
        allowLateJoin: { type: Boolean, default: true },
        randomizeQuestions: { type: Boolean, default: false },
        randomizeOptions: { type: Boolean, default: false },
        requireApproval: { type: Boolean, default: false },
        autoStart: { type: Boolean, default: false },
        musicEnabled: { type: Boolean, default: true },
        soundAvailable: { type: Boolean, default: true },
    },

    // Game State
    status: {
        type: String,
        enum: ["waiting", "starting", "active", "paused", "finished"],
        default: "waiting",
        index: true,
    },
    currentQuestionIndex: { type: Number, default: -1 },
    startedAt: Date,
    endedAt: Date,

    // Participants
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        socketId: String,
        username: String,
        displayName: String,
        avatar: String,
        ipAddress: String,
        userAgent: String,
        deviceType: String,
        joinedAt: { type: Date, default: Date.now },
        lastPing: Date,
        status: {
            type: String,
            enum: ["waiting", "ready", "playing", "disconnected", "banned"],
            default: "waiting",
        },
        isReady: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        answers: [{
            questionIndex: Number,
            answer: String, // option text
            isCorrect: Boolean,
            timeTaken: Number,
            points: Number,
            answeredAt: Date,
        }],
    }],

    // Waiting List for Approval
    waitingList: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        displayName: String,
        avatar: String,
        socketId: String,
        requestedAt: { type: Date, default: Date.now },
    }],

    bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Temporary State (not persisted long term)
    activeQuestion: {
        startTime: Date,
        endTime: Date,
    },

    // Metadata
    metadata: {
        source: { type: String, default: "web" },
        ipAddress: String,
        userAgent: String,
        region: String,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Index for faster queries
sessionSchema.index({ "participants.userId": 1 });
sessionSchema.index({ "hostId": 1, "status": 1 });
sessionSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 604800 }); // Auto-delete after 7 days

module.exports = mongoose.model("Session", sessionSchema);
