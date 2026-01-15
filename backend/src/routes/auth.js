const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register or update user from Firebase
router.post('/register', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL, role, provider } = req.body;

        let user = await User.findOne({ uid });

        if (user) {
            // Update existing user
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            await user.save();
        } else {
            // Create new user
            user = new User({
                uid,
                email,
                displayName,
                photoURL: photoURL || '',
                role: role || 'user',
                provider: provider || 'email'
            });
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
