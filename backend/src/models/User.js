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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
