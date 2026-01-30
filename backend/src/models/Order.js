const mongoose = require('mongoose');

// Order item schema for FastGas cylinders
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantSize: {
        type: String,
        enum: ['6kg', '13kg', '25kg', '50kg'],
        required: true
    },
    sku: String,
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    image: String
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    // Order type: client (end customer) or reseller (bulk purchase)
    orderType: {
        type: String,
        enum: ['client', 'reseller'],
        default: 'client'
    },
    // Price tier used for this order
    priceTier: {
        type: String,
        enum: ['retail', 'reseller', 'wholesale'],
        default: 'retail'
    },
    // Customer/Buyer info
    userId: {
        type: String,
        required: true
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    // Reseller tracking (if order placed through a reseller or by a reseller)
    resellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resellerInfo: {
        name: String,
        businessName: String,
        phone: String,
        commissionRate: Number
    },
    // For client orders placed through reseller
    placedThroughReseller: {
        type: Boolean,
        default: false
    },
    // Order items (FastGas cylinders with variants)
    items: [orderItemSchema],
    // Shipping/Delivery address
    shippingAddress: {
        street: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' },
        landmark: String,
        instructions: String
    },
    // Payment information
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'cash', 'bank_transfer', 'credit'],
        default: 'mpesa'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    // M-Pesa specific fields
    mpesaTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpesaTransaction',
        default: null
    },
    mpesaReceiptNumber: String,
    mpesaPhone: String,
    // Order status
    status: {
        type: String,
        enum: ['pending', 'processing', 'confirmed', 'shipped', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    // Tracking and Rider Assignment
    trackingId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return `FG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
    },
    riderId: {
        type: String,
        default: null
    },
    riderInfo: {
        name: String,
        phone: String,
        vehicleType: String,
        vehicleNumber: String,
        rating: Number
    },
    riderStatus: {
        type: String,
        enum: ['pending', 'assigned', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered'],
        default: 'pending'
    },
    // Timestamps for tracking
    riderAssignedAt: {
        type: Date,
        default: null
    },
    riderAcceptedAt: {
        type: Date,
        default: null
    },
    pickedUpAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    // Financials
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Reseller commission (calculated when order is completed)
    resellerCommission: {
        type: Number,
        default: 0
    },
    // Admin profit tracking
    profit: {
        type: Number,
        default: 0
    },
    // Notes
    customerNotes: String,
    adminNotes: String,
    // Cancellation/Return info
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: String,
    cancellationReason: String,
    returnedAt: {
        type: Date,
        default: null
    },
    returnReason: String
}, { timestamps: true });

// Generate tracking ID before saving
orderSchema.pre('save', function (next) {
    if (!this.trackingId) {
        this.trackingId = `FG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
    next();
});

// Method to calculate reseller commission
orderSchema.methods.calculateResellerCommission = function() {
    if (this.resellerId && this.resellerInfo?.commissionRate) {
        this.resellerCommission = (this.subtotal * this.resellerInfo.commissionRate) / 100;
    }
    return this.resellerCommission;
};

// Method to get order summary
orderSchema.methods.getSummary = function() {
    return {
        orderId: this.orderId,
        trackingId: this.trackingId,
        status: this.status,
        total: this.total,
        itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
        orderType: this.orderType
    };
};

module.exports = mongoose.model('Order', orderSchema);
