const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get friends list
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'username avatar stats.level status lastSeen');
        res.json(user.friends);
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friend requests (incoming and outgoing)
router.get('/requests', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('friendRequests.from', 'username avatar stats.level')
            .populate('friendRequests.to', 'username avatar stats.level');

        const incoming = user.friendRequests.filter(req => req.to?._id.toString() === user._id.toString() && req.status === 'pending');
        const outgoing = user.friendRequests.filter(req => req.from?._id.toString() === user._id.toString() && req.status === 'pending');

        res.json({ incoming, outgoing });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get suggested friends
router.get('/suggestions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Find users who are NOT current user, NOT already friends, and NOT in pending requests
        // A simple logic: get random 5 users for now, improved logic would be based on mutuals or interests
        const existingIds = [
            user._id,
            ...user.friends,
            ...user.friendRequests.map(r => r.from.toString() === user._id.toString() ? r.to : r.from)
        ];

        const suggestions = await User.find({ _id: { $nin: existingIds } })
            .select('username avatar stats.level')
            .limit(5);

        res.json(suggestions);
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search users
router.get('/search', protect, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user._id }
        })
            .select('username avatar stats.level')
            .limit(10);

        // Enhance with request status check if needed, but frontend can handle checks against friends list
        res.json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send friend request
router.post('/request/:userId', protect, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const requesterId = req.user._id;

        if (targetId === requesterId.toString()) {
            return res.status(400).json({ message: "Cannot send request to self" });
        }

        const targetUser = await User.findById(targetId);
        const requester = await User.findById(requesterId);

        if (!targetUser) return res.status(404).json({ message: "User not found" });

        // Check availability
        const isFriend = requester.friends.includes(targetId);
        if (isFriend) return res.status(400).json({ message: "Already friends" });

        // Check if request already exists (in either direction)
        const existingRequest = requester.friendRequests.find(
            r => (r.from.toString() === requesterId.toString() && r.to.toString() === targetId) ||
                (r.from.toString() === targetId && r.to.toString() === requesterId.toString())
        );

        if (existingRequest) {
            if (existingRequest.status === 'pending') return res.status(400).json({ message: "Request already pending" });
            if (existingRequest.status === 'rejected') {
                // Option: Allow resending after some time, or just update status
                // For simplicity, just error
                return res.status(400).json({ message: "Request was previously rejected" });
            }
        }

        // Create request
        // We push to BOTH users so they can see it queryable from their own doc, 
        // OR typically a separate collection is better. But complying with User model update:
        // We will add the request object to BOTH users' arrays ensuring they match ID if we wanted strict sync,
        // but simple duplication with same data is easier for single-doc reads.
        // Actually, let's look at the schema I added: friendRequests: [{ from, to, status... }]

        const requestData = {
            from: requesterId,
            to: targetId,
            status: 'pending',
            createdAt: new Date()
        };

        // Add to requester
        requester.friendRequests.push(requestData);
        await requester.save();

        // Add to target
        targetUser.friendRequests.push(requestData);
        await targetUser.save();

        res.json({ message: "Friend request sent" });

    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept request
// Note: Frontend calls passing the REQUEST ID usually, but here we stored requests embedded. 
// We need to find the matching request in the user's array.
router.post('/accept/:requestId', protect, async (req, res) => {
    try {
        // Since we don't have a separate collection with unique IDs for requests easily addressable (unless we use the subdoc _id),
        // we'll assume the frontend sends the subdoc _id of the request.

        const user = await User.findById(req.user._id);
        const request = user.friendRequests.id(req.params.requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ message: "Request not pending" });
        if (request.to.toString() !== user._id.toString()) return res.status(403).json({ message: "Not your request to accept" });

        const otherUserId = request.from;
        const otherUser = await User.findById(otherUserId);

        if (!otherUser) return res.status(404).json({ message: "Sender not found" });

        // Update status in current user
        request.status = 'accepted';
        user.friends.push(otherUserId);

        // Update status in other user
        const otherRequest = otherUser.friendRequests.find(r =>
            r.from.toString() === otherUserId.toString() &&
            r.to.toString() === user._id.toString() &&
            r.status === 'pending'
        );
        if (otherRequest) {
            otherRequest.status = 'accepted';
        }
        otherUser.friends.push(user._id);

        await user.save();
        await otherUser.save();

        res.json({ message: "Friend request accepted" });

    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Decline request
router.post('/decline/:requestId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const request = user.friendRequests.id(req.params.requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });

        // Remove from both
        const otherUserId = request.from;
        const otherUser = await User.findById(otherUserId);

        // Remove from current user
        user.friendRequests.pull(req.params.requestId);
        await user.save();

        // Remove from other user matching request
        if (otherUser) {
            const otherRequest = otherUser.friendRequests.find(r =>
                r.from.toString() === otherUserId.toString() &&
                r.to.toString() === user._id.toString()
            );
            if (otherRequest) {
                otherUser.friendRequests.pull(otherRequest._id);
                await otherUser.save();
            }
        }

        res.json({ message: "Friend request declined" });
    } catch (error) {
        console.error('Decline request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
