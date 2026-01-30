// backend/src/models/MpesaTransaction.js
// Model for tracking M-Pesa payment transactions
const mongoose = require('mongoose');

const mpesaTransactionSchema = new mongoose.Schema({
    // Transaction identification
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    // M-Pesa specific fields
    merchantRequestId: {
        type: String,
        required: true
    },
    checkoutRequestId: {
        type: String,
        required: true,
        unique: true
    },
    mpesaReceiptNumber: {
        type: String,
        default: null,
        sparse: true // Allows null but must be unique if present
    },
    // Phone number used for payment
    phoneNumber: {
        type: String,
        required: true
    },
    // Amount
    amount: {
        type: Number,
        required: true
    },
    // Transaction type
    transactionType: {
        type: String,
        enum: ['CustomerPayBillOnline', 'CustomerBuyGoodsOnline', 'SalaryPayment', 'BusinessPayment', 'PromotionPayment'],
        default: 'CustomerPayBillOnline'
    },
    // Related order (can be client order or reseller order)
    orderType: {
        type: String,
        enum: ['client_order', 'reseller_order'],
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'orderModelRef',
        required: true
    },
    orderModelRef: {
        type: String,
        enum: ['Order', 'ResellerOrder'],
        required: true
    },
    // User who initiated the payment
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Transaction status
    status: {
        type: String,
        enum: ['initiated', 'pending', 'processing', 'completed', 'failed', 'cancelled', 'timeout'],
        default: 'initiated'
    },
    // Result details from M-Pesa callback
    resultCode: {
        type: Number,
        default: null
    },
    resultDescription: {
        type: String,
        default: null
    },
    // M-Pesa callback data
    callbackData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Transaction timestamps from M-Pesa
    mpesaTransactionDate: {
        type: Date,
        default: null
    },
    // Account reference (what shows on customer's M-Pesa statement)
    accountReference: {
        type: String,
        required: true,
        default: 'FastGas'
    },
    // Transaction description
    transactionDescription: {
        type: String,
        default: 'FastGas Cylinder Payment'
    },
    // Retry tracking
    retryCount: {
        type: Number,
        default: 0
    },
    lastRetryAt: {
        type: Date,
        default: null
    },
    // Refund tracking
    isRefunded: {
        type: Boolean,
        default: false
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundReason: String,
    // Metadata for debugging
    ipAddress: String,
    userAgent: String,
    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    failedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for faster queries
mpesaTransactionSchema.index({ phoneNumber: 1, status: 1 });
mpesaTransactionSchema.index({ userId: 1, createdAt: -1 });
mpesaTransactionSchema.index({ checkoutRequestId: 1 });

// Pre-save hook to generate transactionId if not present
mpesaTransactionSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
    next();
});

// Method to mark as completed
mpesaTransactionSchema.methods.markCompleted = function(mpesaReceiptNumber, callbackData) {
    this.status = 'completed';
    this.mpesaReceiptNumber = mpesaReceiptNumber;
    this.completedAt = new Date();
    this.callbackData = callbackData;
    if (callbackData?.TransactionDate) {
        this.mpesaTransactionDate = new Date(callbackData.TransactionDate);
    }
    return this.save();
};

// Method to mark as failed
mpesaTransactionSchema.methods.markFailed = function(resultCode, resultDescription) {
    this.status = 'failed';
    this.resultCode = resultCode;
    this.resultDescription = resultDescription;
    this.failedAt = new Date();
    return this.save();
};

// Method to process refund
mpesaTransactionSchema.methods.processRefund = function(amount, reason) {
    this.isRefunded = true;
    this.refundedAt = new Date();
    this.refundAmount = amount;
    this.refundReason = reason;
    return this.save();
};

// Static method to get user's transaction history
mpesaTransactionSchema.statics.getUserTransactions = function(userId, limit = 20) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('orderId');
};

// Static method to get pending transactions (for cleanup/retry)
mpesaTransactionSchema.statics.getPendingTransactions = function(olderThanMinutes = 5) {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    return this.find({
        status: { $in: ['initiated', 'pending', 'processing'] },
        createdAt: { $lt: cutoffTime }
    });
};

// Static method to get transaction stats
mpesaTransactionSchema.statics.getTransactionStats = async function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
};

module.exports = mongoose.model('MpesaTransaction', mpesaTransactionSchema);
