const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'rider', 'admin'],
        default: 'user'
    },
    provider: {
        type: String,
        enum: ['google', 'email'],
        required: true
    },
    // Rider-specific fields
    riderInfo: {
        vehicleType: {
            type: String,
            enum: ['bike', 'car', 'van', 'bicycle'],
            default: null
        },
        vehicleNumber: {
            type: String,
            default: null
        },
        licenseNumber: {
            type: String,
            default: null
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        currentLocation: {
            latitude: Number,
            longitude: Number
        },
        completedDeliveries: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 5.0
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
