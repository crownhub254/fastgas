// M-Pesa Transaction Model - MongoDB Schema
// Tracks all M-Pesa payment transactions

import mongoose from 'mongoose';

const mpesaTransactionSchema = new mongoose.Schema({
    // Order Reference
    orderId: {
        type: String,
        required: true,
        index: true,
    },
    
    // User
    userId: {
        type: String,
        required: true,
        index: true,
    },
    
    // Phone Number
    phoneNumber: {
        type: String,
        required: true,
    },
    
    // Amount
    amount: {
        type: Number,
        required: true,
    },
    
    // M-Pesa Request IDs
    merchantRequestId: {
        type: String,
        required: true,
    },
    checkoutRequestId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    
    // M-Pesa Response (after callback)
    mpesaReceiptNumber: {
        type: String,
        // sparse index is created via schema.index() below
    },
    transactionDate: {
        type: Date,
    },
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'timeout'],
        default: 'pending',
    },
    
    // Result from callback
    resultCode: {
        type: Number,
    },
    resultDesc: {
        type: String,
    },
    
    // Full callback data (for debugging)
    callbackData: {
        type: mongoose.Schema.Types.Mixed,
    },
    
    // Account Reference
    accountReference: {
        type: String,
    },
    
    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
    
    // Retry tracking
    retryCount: {
        type: Number,
        default: 0,
    },
    lastRetryAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes
// Note: orderId already has index: true, checkoutRequestId has unique: true
mpesaTransactionSchema.index({ status: 1, createdAt: -1 });
mpesaTransactionSchema.index({ mpesaReceiptNumber: 1 }, { sparse: true, unique: true });

// Check if transaction is still pending (not timed out)
mpesaTransactionSchema.methods.isStillPending = function() {
    if (this.status !== 'pending') return false;
    
    // Timeout after 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return this.initiatedAt > twoMinutesAgo;
};

// Mark as completed
mpesaTransactionSchema.methods.markCompleted = async function(callbackData) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.callbackData = callbackData;
    
    if (callbackData.Body?.stkCallback?.CallbackMetadata?.Item) {
        const items = callbackData.Body.stkCallback.CallbackMetadata.Item;
        
        for (const item of items) {
            switch (item.Name) {
                case 'MpesaReceiptNumber':
                    this.mpesaReceiptNumber = item.Value;
                    break;
                case 'TransactionDate':
                    // Parse M-Pesa date format (YYYYMMDDHHmmss)
                    const dateStr = String(item.Value);
                    this.transactionDate = new Date(
                        parseInt(dateStr.slice(0, 4)),
                        parseInt(dateStr.slice(4, 6)) - 1,
                        parseInt(dateStr.slice(6, 8)),
                        parseInt(dateStr.slice(8, 10)),
                        parseInt(dateStr.slice(10, 12)),
                        parseInt(dateStr.slice(12, 14))
                    );
                    break;
            }
        }
    }
    
    return this.save();
};

// Mark as failed
mpesaTransactionSchema.methods.markFailed = async function(resultCode, resultDesc, callbackData) {
    this.status = resultCode === 1032 ? 'cancelled' : 'failed';
    this.resultCode = resultCode;
    this.resultDesc = resultDesc;
    this.callbackData = callbackData;
    this.completedAt = new Date();
    
    return this.save();
};

// Static method to find pending transactions for cleanup
mpesaTransactionSchema.statics.findTimedOutTransactions = function() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return this.find({
        status: 'pending',
        initiatedAt: { $lt: twoMinutesAgo },
    });
};

export default mongoose.models.MpesaTransaction || mongoose.model('MpesaTransaction', mpesaTransactionSchema);
