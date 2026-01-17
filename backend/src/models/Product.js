// backend/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    features: [{
        type: String
    }],
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    reviews: [{
        userId: {
            type: String,
            required: true
        },
        userName: String,
        userPhoto: String,
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        verified: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    // NEW FIELDS FOR SELLER INFO
    sellerEmail: {
        type: String,
        default: null
    },
    userId: {
        type: String,
        default: null
    },
    sellerName: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
productSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Product', productSchema);
