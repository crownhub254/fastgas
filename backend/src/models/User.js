const mongoose = require('mongoose');

// Reseller Profile Schema - embedded in user for resellers
const resellerProfileSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true
    },
    businessRegistrationNumber: {
        type: String,
        default: null
    },
    businessLocation: {
        address: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' }
    },
    // Commission and pricing
    commissionRate: {
        type: Number,
        default: 10 // 10% commission on sales
    },
    priceTier: {
        type: String,
        enum: ['standard', 'premium', 'wholesale'],
        default: 'standard'
    },
    // Financial tracking
    totalSales: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalCommissionEarned: {
        type: Number,
        default: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    // Inventory
    currentStockLevel: {
        type: Number,
        default: 0
    },
    // Performance metrics
    activeClients: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    averageOrderValue: {
        type: Number,
        default: 0
    },
    // Approval status
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: String,
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    // Documents for verification
    documents: [{
        type: {
            type: String,
            enum: ['id', 'business_permit', 'tax_certificate', 'other']
        },
        url: String,
        verified: { type: Boolean, default: false }
    }],
    // M-Pesa details for payments
    mpesaPhone: {
        type: String,
        default: null
    },
    // Notes from admin
    adminNotes: {
        type: String,
        default: null
    }
});

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
        enum: ['user', 'customer', 'reseller', 'seller', 'rider', 'admin'],
        default: 'user'
    },
    provider: {
        type: String,
        enum: ['google', 'email', 'phone'],
        required: true
    },
    // Reseller specific profile (only for resellers)
    resellerProfile: {
        type: resellerProfileSchema,
        default: null
    },
    // Client tracking (which reseller referred this client)
    referredByReseller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Location for delivery
    defaultAddress: {
        street: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' }
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Method to check if user is a reseller
userSchema.methods.isReseller = function() {
    return this.role === 'reseller';
};

// Method to check if reseller is approved
userSchema.methods.isApprovedReseller = function() {
    return this.role === 'reseller' && this.resellerProfile?.isApproved === true;
};

// Method to get appropriate price tier
userSchema.methods.getPriceTier = function() {
    if (this.role === 'reseller' && this.resellerProfile) {
        return this.resellerProfile.priceTier;
    }
    return 'retail';
};

module.exports = mongoose.model('User', userSchema);
