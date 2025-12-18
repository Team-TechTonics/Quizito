const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    // Get token from header (support both x-auth-token and Bearer)
    let token = req.header('x-auth-token');

    if (!token && req.header('Authorization')) {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7, authHeader.length);
        }
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database to ensure full object (username, etc.) is available
        const User = require('../models/User'); // Lazy load to avoid circular dependency if any
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({ msg: 'Token valid but user not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
