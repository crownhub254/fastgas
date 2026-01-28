const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Appearance & Display Preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        },
        language: {
            type: String,
            enum: ['en', 'es', 'fr', 'de', 'bn'],
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        dateFormat: {
            type: String,
            enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
            default: 'MM/DD/YYYY'
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },

    // Notification Preferences
    notifications: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        orderUpdates: {
            type: Boolean,
            default: true
        },
        productUpdates: {
            type: Boolean,
            default: false
        },
        newsletter: {
            type: Boolean,
            default: false
        },
        securityAlerts: {
            type: Boolean,
            default: true
        },
        promotions: {
            type: Boolean,
            default: false
        },
        comments: {
            type: Boolean,
            default: true
        },
        mentions: {
            type: Boolean,
            default: true
        }
    },

    // Privacy Settings
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        },
        showEmail: {
            type: Boolean,
            default: false
        },
        showPhone: {
            type: Boolean,
            default: false
        },
        activityStatus: {
            type: Boolean,
            default: true
        },
        dataCollection: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Static method to get or create settings
settingsSchema.statics.getOrCreate = async function (userId) {
    let settings = await this.findOne({ userId });
    if (!settings) {
        settings = await this.create({ userId });
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
