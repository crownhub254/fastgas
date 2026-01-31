// Product Model - MongoDB Schema
// FastGas N₂O Cream Charger Products

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    
    // Category
    category: {
        type: String,
        enum: ['cream-charger', 'accessory', 'equipment'],
        required: true,
    },
    
    // Description
    description: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
    },
    
    // Pricing - Tiered system
    retailPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    resellerPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    wholesalePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    
    // Cost for profit calculation
    costPrice: {
        type: Number,
        default: 0,
    },
    
    // Inventory
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    lowStockThreshold: {
        type: Number,
        default: 20,
    },
    trackInventory: {
        type: Boolean,
        default: true,
    },
    
    // Product Details
    weight: {
        type: Number, // in kg
        default: 0,
    },
    dimensions: {
        height: { type: Number }, // in cm
        width: { type: Number },
        depth: { type: Number },
        diameter: { type: Number },
    },
    
    // Images
    image: {
        type: String,
        default: '/images/product-placeholder.png',
    },
    images: [{
        type: String,
    }],
    
    // Specifications
    specifications: {
        type: Map,
        of: String,
    },
    
    // Features list
    features: [{
        type: String,
    }],
    
    // Safety Info
    safetyInfo: {
        type: String,
    },
    
    // Certifications
    certifications: [{
        type: String,
    }],
    
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    
    // Status
    isActive: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    
    // Sales Stats
    totalSold: {
        type: Number,
        default: 0,
    },
    totalResellerSales: {
        type: Number,
        default: 0,
    },
    
    // Rating
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Indexes
// Note: slug and sku already have unique: true which creates indexes
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'out-of-stock';
    if (this.stock <= this.lowStockThreshold) return 'low-stock';
    return 'in-stock';
});

// Method to get price based on user role/tier
productSchema.methods.getPriceForUser = function(user) {
    if (!user) return this.retailPrice;
    
    if (user.role === 'reseller' && user.resellerProfile?.isApproved) {
        const tier = user.resellerProfile.priceTier;
        if (tier === 'wholesale') return this.wholesalePrice;
        return this.resellerPrice;
    }
    
    if (user.role === 'distributor') {
        return this.wholesalePrice;
    }
    
    return this.retailPrice;
};

// Static method to get all active products
productSchema.statics.getActiveProducts = function() {
    return this.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
};

// Static method to update stock
productSchema.statics.updateStock = async function(productId, quantity, operation = 'decrease') {
    const update = operation === 'decrease' 
        ? { $inc: { stock: -quantity, totalSold: quantity } }
        : { $inc: { stock: quantity } };
    
    return this.findByIdAndUpdate(productId, update, { new: true });
};

export default mongoose.models.Product || mongoose.model('Product', productSchema);
