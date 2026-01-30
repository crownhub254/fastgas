// backend/src/models/Product.js
// FastGas Cylinder Product Model - Single Product with Variants
const mongoose = require('mongoose');

// Cylinder size variant schema
const cylinderVariantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        enum: ['6kg', '13kg', '25kg', '50kg'] // FastGas cylinder sizes
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    retailPrice: {
        type: Number,
        required: true
    },
    resellerPrice: {
        type: Number,
        required: true
    },
    wholesalePrice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    weight: {
        type: Number, // Weight in kg
        required: true
    },
    dimensions: {
        height: Number, // in cm
        diameter: Number // in cm
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const productSchema = new mongoose.Schema({
    // FastGas specific fields
    name: {
        type: String,
        required: true,
        default: 'FastGas Cylinder'
    },
    description: {
        type: String,
        required: true,
        default: 'Premium quality FastGas cylinder for cooking and industrial use'
    },
    brand: {
        type: String,
        default: 'FastGas'
    },
    productType: {
        type: String,
        enum: ['gas-cylinder'],
        default: 'gas-cylinder'
    },
    gasType: {
        type: String,
        enum: ['LPG', 'Propane', 'Butane', 'Mixed'],
        default: 'LPG'
    },
    // Main product image
    image: {
        type: String,
        required: true
    },
    // Additional images
    images: [{
        type: String
    }],
    // Cylinder variants (different sizes)
    variants: [cylinderVariantSchema],
    // Safety and compliance
    safetyInfo: {
        type: String,
        default: 'Handle with care. Store in well-ventilated area. Keep away from heat sources.'
    },
    certifications: [{
        type: String
    }],
    // Product features
    features: [{
        type: String
    }],
    specifications: {
        gasComposition: String,
        pressureRating: String,
        valveType: String,
        material: String,
        warranty: String
    },
    // Reviews
    rating: {
        type: Number,
        default: 0
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
    // Reseller specific tracking
    totalSold: {
        type: Number,
        default: 0
    },
    totalResellerSales: {
        type: Number,
        default: 0
    },
    totalClientSales: {
        type: Number,
        default: 0
    },
    // Admin info
    createdBy: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
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

// Method to get price based on user type
productSchema.methods.getPriceForUserType = function(variantSize, userType) {
    const variant = this.variants.find(v => v.size === variantSize);
    if (!variant) return null;
    
    switch(userType) {
        case 'reseller':
            return variant.resellerPrice;
        case 'wholesale':
            return variant.wholesalePrice;
        default:
            return variant.retailPrice;
    }
};

// Method to check stock availability
productSchema.methods.checkStock = function(variantSize, quantity) {
    const variant = this.variants.find(v => v.size === variantSize);
    if (!variant) return false;
    return variant.stock >= quantity;
};

// Method to update stock
productSchema.methods.updateStock = function(variantSize, quantity, operation = 'decrease') {
    const variant = this.variants.find(v => v.size === variantSize);
    if (!variant) return false;
    
    if (operation === 'decrease') {
        variant.stock -= quantity;
    } else {
        variant.stock += quantity;
    }
    return true;
};

module.exports = mongoose.model('Product', productSchema);
