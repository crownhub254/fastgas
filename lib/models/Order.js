// Order Model - MongoDB Schema
// Handles all order types: retail, reseller, bulk

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    county: { type: String, required: true },
    postalCode: { type: String },
    instructions: { type: String }, // Delivery instructions
});

const orderSchema = new mongoose.Schema({
    // Order ID (human-readable)
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    
    // Customer
    userId: {
        type: String, // Firebase UID
        required: true,
        index: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
    },
    
    // Reseller (if ordered through reseller)
    resellerId: {
        type: String, // Firebase UID of reseller
        index: true,
    },
    resellerName: { type: String },
    
    // Order Type
    orderType: {
        type: String,
        enum: ['retail', 'reseller', 'bulk', 'wholesale'],
        default: 'retail',
    },
    
    // Items
    items: [orderItemSchema],
    
    // Pricing
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    discountCode: { type: String },
    shippingFee: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    
    // Shipping
    shippingAddress: shippingAddressSchema,
    shippingMethod: {
        type: String,
        enum: ['standard', 'express', 'pickup'],
        default: 'standard',
    },
    
    // Payment
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'cod', 'bank-transfer'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    paidAt: { type: Date },
    
    // M-Pesa Transaction Details
    mpesaTransaction: {
        merchantRequestId: { type: String },
        checkoutRequestId: { type: String },
        mpesaReceiptNumber: { type: String },
        transactionDate: { type: Date },
        phoneNumber: { type: String },
        amount: { type: Number },
    },
    
    // Order Status
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'],
        default: 'pending',
    },
    
    // Status History
    statusHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: String }, // UID of admin/rider
    }],
    
    // Delivery
    rider: {
        riderId: { type: String },
        riderName: { type: String },
        riderPhone: { type: String },
        assignedAt: { type: Date },
    },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    deliveryProof: { type: String }, // Image URL
    
    // Notes
    customerNote: { type: String },
    adminNote: { type: String },
    
    // Flags
    isGift: { type: Boolean, default: false },
    giftMessage: { type: String },
    requiresSignature: { type: Boolean, default: false },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Indexes
// Note: orderId already has unique: true which creates an index
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'rider.riderId': 1 });

// Generate order ID
orderSchema.statics.generateOrderId = async function() {
    const date = new Date();
    const prefix = 'FG';
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}${year}${month}${day}-${sequence}`;
};

// Update status with history
orderSchema.methods.updateStatus = async function(newStatus, note = '', updatedBy = '') {
    this.orderStatus = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note,
        updatedBy,
    });
    
    if (newStatus === 'delivered') {
        this.deliveredAt = new Date();
    }
    
    return this.save();
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal - this.discount + this.shippingFee + this.tax;
    return this;
};

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
