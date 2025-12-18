const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    // Question Content
    question: {
        type: String,
        required: [true, "Question text is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["multiple-choice", "true-false", "short-answer", "image-based", "audio-based", "code-based"],
        default: "multiple-choice",
    },

    // Options (for multiple choice)
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        imageUrl: String,
        code: String,
        explanation: String,
    }],

    // Correct answer information
    correctAnswer: String,
    correctIndex: Number,
    correctAnswers: [String], // For multiple correct answers
    explanation: {
        text: String,
        imageUrl: String,
        videoUrl: String,
    },

    // Metadata
    points: { type: Number, default: 100 },
    timeLimit: { type: Number, default: 30 }, // in seconds
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    },
    tags: [String],
    hint: String,
});

const quizSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, "Quiz title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
        index: true,
    },
    description: {
        type: String,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    shortDescription: {
        type: String,
        maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Categorization
    category: {
        type: String,
        required: [true, "Category is required"],
        index: true,
    },
    subcategory: String,
    tags: [{ type: String, index: true }],
    difficulty: {
        type: String,
        enum: ["beginner", "easy", "medium", "hard", "expert", "mixed"],
        default: "medium",
        index: true,
    },

    // Content
    questions: [questionSchema],
    thumbnail: String,
    coverImage: String,
    language: { type: String, default: "en", index: true },

    // Settings and Configuration
    settings: {
        randomizeQuestions: { type: Boolean, default: false },
        randomizeOptions: { type: Boolean, default: false },
        showProgress: { type: Boolean, default: true },
        showTimer: { type: Boolean, default: true },
        showResults: { type: Boolean, default: true },
        showExplanations: { type: Boolean, default: true },
        showLeaderboard: { type: Boolean, default: true },
        allowRetake: { type: Boolean, default: true },
        allowReview: { type: Boolean, default: true },
        requireLogin: { type: Boolean, default: true },
        passingScore: { type: Number, default: 60, min: 0, max: 100 },
        maxAttempts: { type: Number, default: 0 }, // 0 = unlimited
        timeLimit: { type: Number, default: 0 }, // 0 = unlimited (for entire quiz)
        questionTimeLimit: { type: Boolean, default: true },
        accessType: { type: String, enum: ["public", "private", "link", "class"], default: "public" },
        schedule: {
            startDate: Date,
            endDate: Date,
        },
        certificate: { type: Boolean, default: false },
        adaptiveDifficulty: { type: Boolean, default: false },
    },

    // Creator Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },

    // Visibility and Access
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted", "organization"],
        default: "public",
        index: true,
    },
    accessCode: String,
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    allowedEmails: [String],

    // Statistics and Popularity
    stats: {
        totalPlays: { type: Number, default: 0, index: true },
        completions: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        popularity: { type: Number, default: 0, index: true },
    },

    // Social Features
    likesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        reported: { type: Boolean, default: false },
    }],
    commentsList: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        replies: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: String,
            createdAt: { type: Date, default: Date.now },
        }],
    }],

    // Metadata
    aiGenerated: { type: Boolean, default: false },
    aiModel: String,
    sourceMaterial: String, // PDF, URL, Text used to generate
    generationTime: Number, // Time taken to generate in ms

    // Versions and history
    version: { type: Number, default: 1 },
    parentQuiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }, // If forked/duplicated
    changelog: [{
        version: Number,
        changes: [String],
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
    }],

    // Moderation
    moderated: { type: Boolean, default: false },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationDate: Date,
    status: {
        type: String,
        enum: ["draft", "published", "archived", "flagged", "banned"],
        default: "draft",
        index: true,
    },
    flaggedReason: String,
    flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Scheduling
    scheduledPublish: Date,
    scheduledArchive: Date,

    // SEO and Discovery
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: { type: String, unique: true, index: true },

    // Analytics
    lastPlayed: Date,
    trendingScore: { type: Number, default: 0, index: true },

    // Accessibility
    accessibility: {
        supportsScreenReader: { type: Boolean, default: true },
        supportsKeyboard: { type: Boolean, default: true },
        supportsVoice: { type: Boolean, default: false },
        altText: String,
        transcripts: [{
            language: String,
            text: String,
        }],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for average rating
quizSchema.virtual("averageRating").get(function () {
    if (this.stats.ratingCount === 0) return 0;
    return this.stats.rating / this.stats.ratingCount;
});

// Pre-save middleware to generate slug
quizSchema.pre("save", async function (next) {
    if (!this.slug && this.title) {
        let slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/--+/g, "-")
            .trim();

        // Ensure uniqueness
        let originalSlug = slug;
        let counter = 1;
        const Quiz = mongoose.models.Quiz || this.constructor; // Handle model compilation
        while (await Quiz.findOne({ slug })) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
});

module.exports = mongoose.model("Quiz", quizSchema);
