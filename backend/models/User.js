const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    // Identity
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username must be less than 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"],
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false, // Don't return password by default
    },

    // Profile
    displayName: String,
    firstName: String,
    lastName: String,
    bio: {
        type: String,
        maxlength: [500, "Bio must be less than 500 characters"],
    },
    avatar: {
        type: String,
        default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", // Default avatar
    },
    coverImage: String,

    // Role and Permissions
    role: {
        type: String,
        enum: ["student", "teacher", "admin", "organization", "moderator", "user"],
        default: "student",
        index: true,
    },
    // Use Mixed type to allow both legacy strings ("admin") and new object structure ({ canCreateQuizzes: true })
    // This prevents CastError regardless of what data format is in the DB
    permissions: [mongoose.Schema.Types.Mixed],
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Self-reference for org members
    },
    isVerified: { type: Boolean, default: false }, // Organization verification

    // Game Stats
    stats: {
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        quizzesPlayed: { type: Number, default: 0 },
        quizzesCreated: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastPlayed: Date,
        wins: { type: Number, default: 0 },
        topCategory: String,
        achievements: [{
            id: String,
            unlockedAt: { type: Date, default: Date.now },
        }],
    },

    // Account Status
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    banExpires: Date,
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,

    // Preferences
    preferences: {
        theme: { type: String, default: "system" }, // light, dark, system
        language: { type: String, default: "en" },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false },
        },
        soundEnabled: { type: Boolean, default: true },
        musicEnabled: { type: Boolean, default: true },
        privacy: {
            profileVisibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
            showActivity: { type: Boolean, default: true },
        },
    },

    // Social
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }],
    socialLinks: {
        twitter: String,
        github: String,
        linkedin: String,
    },

    // Metadata
    metadata: {
        signupSource: String,
        deviceType: String,
        ipAddress: String,
        userAgent: String,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for follower count
userSchema.virtual("followerCount").get(function () {
    return this.followers?.length || 0;
});

// Virtual for following count
userSchema.virtual("followingCount").get(function () {
    return this.following?.length || 0;
});

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to verify password
// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "30d" }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

module.exports = mongoose.model("User", userSchema);
