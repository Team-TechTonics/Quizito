const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Class name is required"],
        trim: true,
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
        index: true,
        default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    students: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
    }],
    assignments: [{
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        dueDate: Date,
        assignedAt: { type: Date, default: Date.now },
        settings: {
            timeLimit: Number,
            attempts: Number,
        }
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Class", classSchema);
