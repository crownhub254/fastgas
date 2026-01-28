const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get user settings by userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Get or create settings if they don't exist
        const settings = await Settings.getOrCreate(userId);

        console.log('✅ Settings retrieved for user:', userId);

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('❌ Get settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get settings'
        });
    }
});

// Update entire settings object
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { preferences, notifications, privacy } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Get or create settings
        let settings = await Settings.getOrCreate(userId);

        // Update settings
        if (preferences) settings.preferences = { ...settings.preferences, ...preferences };
        if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
        if (privacy) settings.privacy = { ...settings.privacy, ...privacy };

        await settings.save();

        console.log('✅ Settings updated for user:', userId);

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('❌ Update settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update settings'
        });
    }
});

// Update specific category (preferences/notifications/privacy)
router.patch('/:userId/:category', async (req, res) => {
    try {
        const { userId, category } = req.params;
        const updates = req.body;

        if (!userId || !category) {
            return res.status(400).json({
                success: false,
                error: 'User ID and category are required'
            });
        }

        const validCategories = ['preferences', 'notifications', 'privacy'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // Get or create settings
        let settings = await Settings.getOrCreate(userId);

        // Update specific category
        settings[category] = { ...settings[category], ...updates };
        await settings.save();

        console.log(`✅ ${category} updated for user:`, userId);

        res.status(200).json({
            success: true,
            message: `${category} updated successfully`,
            settings
        });
    } catch (error) {
        console.error('❌ Update category error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update category'
        });
    }
});

// Update single setting field
router.patch('/:userId/:category/:field', async (req, res) => {
    try {
        const { userId, category, field } = req.params;
        const { value } = req.body;

        if (!userId || !category || !field) {
            return res.status(400).json({
                success: false,
                error: 'User ID, category, and field are required'
            });
        }

        if (value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Value is required'
            });
        }

        // Get or create settings
        let settings = await Settings.getOrCreate(userId);

        // Check if category exists
        if (!settings[category]) {
            return res.status(400).json({
                success: false,
                error: `Invalid category: ${category}`
            });
        }

        // Update specific field
        settings[category][field] = value;
        await settings.save();

        console.log(`✅ ${category}.${field} updated for user:`, userId);

        res.status(200).json({
            success: true,
            message: `${field} updated successfully`,
            settings
        });
    } catch (error) {
        console.error('❌ Update field error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update field'
        });
    }
});

// Reset settings to default
router.post('/:userId/reset', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Delete existing settings and create new with defaults
        await Settings.findOneAndDelete({ userId });
        const settings = await Settings.create({ userId });

        console.log('✅ Settings reset to defaults for user:', userId);

        res.status(200).json({
            success: true,
            message: 'Settings reset to defaults',
            settings
        });
    } catch (error) {
        console.error('❌ Reset settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to reset settings'
        });
    }
});

// Delete settings (for account deletion)
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const settings = await Settings.findOneAndDelete({ userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                error: 'Settings not found'
            });
        }

        console.log('✅ Settings deleted for user:', userId);

        res.status(200).json({
            success: true,
            message: 'Settings deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete settings'
        });
    }
});

// Export settings (for data download)
router.get('/:userId/export', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const settings = await Settings.findOne({ userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                error: 'Settings not found'
            });
        }

        const exportData = {
            userId: settings.userId,
            preferences: settings.preferences,
            notifications: settings.notifications,
            privacy: settings.privacy,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        console.log('✅ Settings exported for user:', userId);

        res.status(200).json({
            success: true,
            data: exportData
        });
    } catch (error) {
        console.error('❌ Export settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to export settings'
        });
    }
});

// Bulk update (for importing settings)
router.post('/:userId/import', async (req, res) => {
    try {
        const { userId } = req.params;
        const { preferences, notifications, privacy } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Get or create settings
        let settings = await Settings.getOrCreate(userId);

        // Import all settings
        if (preferences) settings.preferences = preferences;
        if (notifications) settings.notifications = notifications;
        if (privacy) settings.privacy = privacy;

        await settings.save();

        console.log('✅ Settings imported for user:', userId);

        res.status(200).json({
            success: true,
            message: 'Settings imported successfully',
            settings
        });
    } catch (error) {
        console.error('❌ Import settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to import settings'
        });
    }
});

module.exports = router;
