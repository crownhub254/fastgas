// User Model - MongoDB Schema
// Synced with Firebase Authentication

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    // Firebase UID - primary identifier
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    
    // Basic Info
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    displayName: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    photoURL: {
        type: String,
    },
    
    // Role-based access
    role: {
        type: String,
        enum: ['user', 'reseller', 'distributor', 'rider', 'admin'],
        default: 'user',
    },
    
    // Reseller Profile (only for resellers)
    resellerProfile: {
        businessName: { type: String },
        businessRegistrationNumber: { type: String },
        businessLocation: {
            address: { type: String },
            city: { type: String },
            county: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number },
            },
        },
        isApproved: { type: Boolean, default: false },
        approvedAt: { type: Date },
        approvedBy: { type: String }, // Admin UID
        priceTier: {
            type: String,
            enum: ['standard', 'premium', 'wholesale'],
            default: 'standard',
        },
        discount: { type: Number, default: 10 }, // Percentage discount
        commissionRate: { type: Number, default: 10 }, // Commission percentage
        totalSales: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalCommissionEarned: { type: Number, default: 0 },
        activeClients: { type: Number, default: 0 },
    },
    
    // Distributor Profile (only for distributors)
    distributorProfile: {
        companyName: { type: String },
        territory: [{ type: String }], // Counties covered
        warehouseLocation: { type: String },
        vehicleCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    
    // Rider Profile (only for riders)
    riderProfile: {
        vehicleType: { type: String, enum: ['motorcycle', 'car', 'van', 'truck'] },
        vehicleRegistration: { type: String },
        licenseNumber: { type: String },
        isAvailable: { type: Boolean, default: true },
        currentLocation: {
            lat: { type: Number },
            lng: { type: Number },
        },
        assignedDistributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        totalDeliveries: { type: Number, default: 0 },
        rating: { type: Number, default: 5.0 },
    },
    
    // Shipping Address (for customers)
    shippingAddresses: [{
        label: { type: String, default: 'Home' },
        fullName: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        county: { type: String },
        postalCode: { type: String },
        isDefault: { type: Boolean, default: false },
    }],
    
    // Preferences
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
    
    // Account Status
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    
    // Timestamps
    lastLoginAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Indexes for common queries
// Note: email already has unique: true which creates an index
userSchema.index({ role: 1 });
userSchema.index({ 'resellerProfile.isApproved': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return this.displayName || this.email.split('@')[0];
});

// Method to get discount based on tier
userSchema.methods.getDiscount = function() {
    if (this.role === 'reseller' && this.resellerProfile?.isApproved) {
        const tierDiscounts = {
            standard: 10,
            premium: 15,
            wholesale: 25,
        };
        return tierDiscounts[this.resellerProfile.priceTier] || 10;
    }
    return 0;
};

// Static method to find or create user from Firebase
userSchema.statics.findOrCreateFromFirebase = async function(firebaseUser) {
    let user = await this.findOne({ uid: firebaseUser.uid });
    
    if (!user) {
        user = await this.create({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
            isEmailVerified: firebaseUser.emailVerified,
        });
    } else {
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
    }
    
    return user;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
