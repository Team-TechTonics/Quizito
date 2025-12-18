const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Middleware already fetched and attached the full user object
        // Just return it directly (password already excluded by middleware)
        res.json(req.user);
    } catch (err) {
        console.error('[Auth] Get User Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        console.log(`[Auth] Login attempt for: ${email}`);

        // Must explicitly select password since it's hidden by default in schema
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`[Auth] User not found: ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check if user has a password (OAuth users might not)
        if (!user.password) {
            console.log(`[Auth] User has no password (possibly OAuth): ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials. Try logging in with Google/GitHub.' });
        }

        // Use model method if available or fallback to direct compare
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`[Auth] Password mismatch for: ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    console.error("[Auth] JWT Sign Error:", err);
                    return res.status(500).json({ msg: "Token generation failed" });
                }
                res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
            }
        );
    } catch (err) {
        console.error("[Auth] Login Exception:", err);
        res.status(500).json({
            success: false,
            msg: 'Server Error during Login',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;
