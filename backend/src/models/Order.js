const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    // Buyer Contact Info
    buyerInfo: {
        name: String,
        email: String,
        phoneNumber: String
    },
    items: [{
        productId: {
            type: String
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    shippingAddress: {
        street: String,
        city: String,
        district: String,
        division: String,
        zipCode: String,
        country: { type: String, default: 'Bangladesh' }
    },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['processing', 'confirmed', 'assigned', 'collected', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'processing'
    },
    // Rider Assignment
    riderId: {
        type: String,
        default: null
    },
    riderInfo: {
        name: String,
        phoneNumber: String,
        vehicleType: String,
        vehicleNumber: String
    },
    assignedBy: {
        userId: String,
        userName: String,
        role: String // 'seller' or 'admin'
    },
    assignedAt: {
        type: Date,
        default: null
    },
    // Delivery Timeline
    timeline: [{
        status: String,
        timestamp: Date,
        location: String,
        note: String
    }],
    estimatedDelivery: {
        type: Date,
        default: null
    },
    actualDelivery: {
        type: Date,
        default: null
    },
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    transactionId: String
}, { timestamps: true });

// Generate tracking ID before saving
orderSchema.pre('save', function (next) {
    if (!this.trackingId) {
        this.trackingId = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
