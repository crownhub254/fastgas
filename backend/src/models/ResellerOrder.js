// backend/src/models/ResellerOrder.js
// Model for tracking reseller bulk purchases/inventory orders from admin
const mongoose = require('mongoose');

const resellerOrderItemSchema = new mongoose.Schema({
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
    }
});

const resellerOrderSchema = new mongoose.Schema({
    // Order identification
    orderId: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return `RO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        }
    },
    // Reseller who placed the order
    resellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resellerInfo: {
        name: String,
        businessName: String,
        email: String,
        phone: String,
        priceTier: String
    },
    // Order items
    items: [resellerOrderItemSchema],
    // Order type
    orderType: {
        type: String,
        enum: ['stock_purchase', 'refill', 'return'],
        default: 'stock_purchase'
    },
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discountReason: String,
    total: {
        type: Number,
        required: true
    },
    // Payment
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'cash', 'bank_transfer', 'credit', 'deferred'],
        default: 'mpesa'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    paymentDueDate: {
        type: Date,
        default: null
    },
    // M-Pesa tracking
    mpesaTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpesaTransaction',
        default: null
    },
    mpesaReceiptNumber: String,
    // Order status
    status: {
        type: String,
        enum: ['pending', 'approved', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Delivery info
    deliveryAddress: {
        street: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' },
        landmark: String
    },
    deliveryMethod: {
        type: String,
        enum: ['pickup', 'delivery'],
        default: 'delivery'
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    // Stock tracking
    stockReceived: {
        type: Boolean,
        default: false
    },
    stockReceivedAt: {
        type: Date,
        default: null
    },
    stockReceivedBy: String,
    // Approval workflow
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    // Timestamps
    dispatchedAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    // Notes
    resellerNotes: String,
    adminNotes: String,
    // Cancellation
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: String,
    cancellationReason: String
}, { timestamps: true });

// Pre-save hook to calculate outstanding balance
resellerOrderSchema.pre('save', function(next) {
    this.outstandingBalance = this.total - this.amountPaid;
    next();
});

// Method to mark stock as received
resellerOrderSchema.methods.markStockReceived = function(receivedBy) {
    this.stockReceived = true;
    this.stockReceivedAt = new Date();
    this.stockReceivedBy = receivedBy;
    this.status = 'delivered';
    return this.save();
};

// Method to add payment
resellerOrderSchema.methods.addPayment = function(amount, mpesaReceipt = null) {
    this.amountPaid += amount;
    this.outstandingBalance = this.total - this.amountPaid;
    
    if (mpesaReceipt) {
        this.mpesaReceiptNumber = mpesaReceipt;
    }
    
    if (this.outstandingBalance <= 0) {
        this.paymentStatus = 'completed';
    } else if (this.amountPaid > 0) {
        this.paymentStatus = 'partial';
    }
    
    return this.save();
};

// Static method to get reseller's pending orders
resellerOrderSchema.statics.getResellerPendingOrders = function(resellerId) {
    return this.find({
        resellerId,
        status: { $in: ['pending', 'approved', 'processing', 'ready', 'dispatched'] }
    }).sort({ createdAt: -1 });
};

// Static method to get reseller's total purchases
resellerOrderSchema.statics.getResellerTotalPurchases = async function(resellerId) {
    const result = await this.aggregate([
        { $match: { resellerId: new mongoose.Types.ObjectId(resellerId), paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    return result[0] || { total: 0, count: 0 };
};

module.exports = mongoose.model('ResellerOrder', resellerOrderSchema);
