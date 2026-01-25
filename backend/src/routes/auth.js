const express = require('express');
const router = express.Router();
const User = require('../models/User');
const NotificationService = require('../utils/notificationService');

// Register or update user from Firebase (with duplicate prevention and notifications)
router.post('/register', async (req, res) => {
    try {

        // IMPORTANT: Extract phoneNumber and riderInfo from req.body
        const { uid, email, displayName, photoURL, role, provider, phoneNumber, riderInfo } = req.body;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                error: 'UID and email are required'
            });
        }

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        let user = await User.findOne({ uid });
        let isNewUser = false;

        if (user) {
            // Update existing user (only if data has changed)
            let hasChanges = false;

            if (displayName && user.displayName !== displayName) {
                user.displayName = displayName;
                hasChanges = true;
            }

            if (phoneNumber && user.phoneNumber !== phoneNumber) {
                user.phoneNumber = phoneNumber;
                hasChanges = true;
            }

            if (photoURL && user.photoURL !== photoURL) {
                user.photoURL = photoURL;
                hasChanges = true;
            }

            // Update role if changed
            if (role && user.role !== role) {
                user.role = role;
                hasChanges = true;
            }

            // Update rider info if provided
            if (role === 'rider' && riderInfo) {
                user.riderInfo = {
                    vehicleType: riderInfo.vehicleType,
                    vehicleNumber: riderInfo.vehicleNumber,
                    licenseNumber: riderInfo.licenseNumber,
                    isAvailable: riderInfo.isAvailable !== undefined ? riderInfo.isAvailable : true,
                    completedDeliveries: riderInfo.completedDeliveries || user.riderInfo?.completedDeliveries || 0,
                    rating: riderInfo.rating || user.riderInfo?.rating || 5.0,
                    currentLocation: riderInfo.currentLocation || user.riderInfo?.currentLocation || null
                };
                hasChanges = true;
            }

            if (hasChanges) {
                await user.save();
                console.log('User updated:', uid);

                // NOTIFICATION: Profile updated (non-blocking)
                setImmediate(async () => {
                    try {
                        await NotificationService.notifyProfileUpdated(uid);
                    } catch (notifError) {
                        console.error('Notification error:', notifError);
                    }
                });
            } else {
                console.log('User exists, no changes:', uid);
            }
        } else {
            // Create new user
            const userData = {
                uid,
                email,
                displayName: displayName || email.split('@')[0],
                phoneNumber, // CRITICAL: Include phoneNumber
                photoURL: photoURL || '',
                role: role || 'user',
                provider: provider || 'email'
            };

            // Add rider info if role is rider
            if (role === 'rider' && riderInfo) {
                userData.riderInfo = {
                    vehicleType: riderInfo.vehicleType,
                    vehicleNumber: riderInfo.vehicleNumber,
                    licenseNumber: riderInfo.licenseNumber,
                    isAvailable: riderInfo.isAvailable !== undefined ? riderInfo.isAvailable : true,
                    completedDeliveries: riderInfo.completedDeliveries || 0,
                    rating: riderInfo.rating || 5.0,
                    currentLocation: riderInfo.currentLocation || null
                };
            }

            console.log('Creating new user with data:', userData);

            user = new User(userData);
            await user.save();
            isNewUser = true;
            console.log('New user created:', uid);

            // NOTIFICATIONS (non-blocking)
            setImmediate(async () => {
                try {
                    // Account created notification
                    await NotificationService.notifyAccountCreated(uid, user);

                    // Notify admins of new user registration
                    const admins = await User.find({ role: 'admin' });
                    for (const admin of admins) {
                        await NotificationService.notifyUserRegistered(admin.uid, user);
                    }
                } catch (notifError) {
                    console.error('Notification error:', notifError);
                }
            });
        }

        res.status(200).json({
            success: true,
            user,
            isNewUser
        });
    } catch (error) {
        console.error('Register/update user error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to register/update user'
        });
    }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});

// Get user by email
router.get('/user-by-email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get user by email error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
    try {
        const { role, search, sort } = req.query;
        let query = {};

        // Role filter
        if (role && role !== 'all') {
            query.role = role;
        }

        // Search filter
        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { uid: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortObj = { createdAt: -1 }; // Default: newest first
        if (sort === 'name') sortObj = { displayName: 1 };
        if (sort === 'email') sortObj = { email: 1 };
        if (sort === 'role') sortObj = { role: 1 };

        const users = await User.find(query).sort(sortObj);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get users'
        });
    }
});

// Update user (Admin - change role, update profile)
router.patch('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { displayName, role, photoURL, phoneNumber } = req.body;

        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update allowed fields
        if (displayName) user.displayName = displayName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (role) {
            // Validate role
            const validRoles = ['user', 'seller', 'rider', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
                });
            }
            user.role = role;
        }
        if (photoURL) user.photoURL = photoURL;

        user.updatedAt = new Date();
        await user.save();

        console.log('User updated by admin:', uid);
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update user'
        });
    }
});

// Delete user (Admin only)
router.delete('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOneAndDelete({ uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log('User deleted by admin:', uid);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            user
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete user'
        });
    }
});

// Get user statistics (for dashboard)
router.get('/users/:uid/stats', async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const stats = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            joinedDate: user.createdAt,
        };

        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user stats'
        });
    }
});

module.exports = router;
