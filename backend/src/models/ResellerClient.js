// backend/src/models/ResellerClient.js
// Model for tracking client-reseller relationships
const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderNumber: String,
    date: {
        type: Date,
        default: Date.now
    },
    items: [{
        variantSize: String,
        quantity: Number,
        unitPrice: Number
    }],
    total: Number,
    paymentStatus: String,
    deliveryStatus: String
});

const resellerClientSchema = new mongoose.Schema({
    // The reseller who has this client
    resellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The client (can be registered user or just contact info)
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Client information (for unregistered clients)
    clientInfo: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: {
            type: String,
            required: true
        },
        address: {
            street: String,
            city: String,
            county: String,
            country: { type: String, default: 'Kenya' },
            landmark: String
        },
        mpesaPhone: String // Phone for M-Pesa payments
    },
    // Client type
    clientType: {
        type: String,
        enum: ['individual', 'business', 'institution'],
        default: 'individual'
    },
    // Business details if applicable
    businessDetails: {
        businessName: String,
        businessType: String,
        registrationNumber: String
    },
    // Relationship status
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    // Financial summary
    totalPurchases: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    // Credit limit (for trusted clients)
    creditLimit: {
        type: Number,
        default: 0
    },
    creditUsed: {
        type: Number,
        default: 0
    },
    // Order statistics
    totalOrders: {
        type: Number,
        default: 0
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    cancelledOrders: {
        type: Number,
        default: 0
    },
    // Average order value
    averageOrderValue: {
        type: Number,
        default: 0
    },
    // Purchase frequency (days between orders on average)
    purchaseFrequency: {
        type: Number,
        default: 0
    },
    // Last activity
    lastPurchaseDate: {
        type: Date,
        default: null
    },
    lastContactDate: {
        type: Date,
        default: null
    },
    // Purchase history summary (last 10 purchases)
    recentPurchases: [purchaseHistorySchema],
    // Preferred products/sizes
    preferredSizes: [{
        size: String,
        orderCount: Number
    }],
    // Communication preferences
    communicationPreferences: {
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
        email: { type: Boolean, default: false }
    },
    // Notes from reseller
    notes: [{
        content: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: String
    }],
    // Tags for categorization
    tags: [{
        type: String
    }],
    // Referral tracking
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResellerClient',
        default: null
    },
    referralCount: {
        type: Number,
        default: 0
    },
    // Rating (reseller's rating of client reliability)
    reliabilityRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    }
}, { timestamps: true });

// Compound index for unique reseller-client relationship
resellerClientSchema.index({ resellerId: 1, 'clientInfo.phone': 1 }, { unique: true });
resellerClientSchema.index({ resellerId: 1, clientId: 1 });

// Pre-save hook to update statistics
resellerClientSchema.pre('save', function(next) {
    // Calculate average order value
    if (this.totalOrders > 0) {
        this.averageOrderValue = this.totalSpent / this.totalOrders;
    }
    next();
});

// Method to add a purchase
resellerClientSchema.methods.addPurchase = async function(order) {
    // Update totals
    this.totalPurchases += 1;
    this.totalOrders += 1;
    this.totalSpent += order.total;
    this.lastPurchaseDate = new Date();
    
    // Add to recent purchases (keep last 10)
    const purchaseRecord = {
        orderId: order._id,
        orderNumber: order.orderId,
        date: new Date(),
        items: order.items.map(item => ({
            variantSize: item.variantSize,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        })),
        total: order.total,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.status
    };
    
    this.recentPurchases.unshift(purchaseRecord);
    if (this.recentPurchases.length > 10) {
        this.recentPurchases = this.recentPurchases.slice(0, 10);
    }
    
    // Update preferred sizes
    for (const item of order.items) {
        const existingPref = this.preferredSizes.find(p => p.size === item.variantSize);
        if (existingPref) {
            existingPref.orderCount += item.quantity;
        } else {
            this.preferredSizes.push({ size: item.variantSize, orderCount: item.quantity });
        }
    }
    
    // Sort preferred sizes by order count
    this.preferredSizes.sort((a, b) => b.orderCount - a.orderCount);
    
    return this.save();
};

// Method to add a note
resellerClientSchema.methods.addNote = function(content, createdBy) {
    this.notes.push({ content, createdBy });
    this.lastContactDate = new Date();
    return this.save();
};

// Static method to get reseller's top clients
resellerClientSchema.statics.getTopClients = function(resellerId, limit = 10) {
    return this.find({ resellerId, status: 'active' })
        .sort({ totalSpent: -1 })
        .limit(limit);
};

// Static method to get clients needing follow-up (no purchase in X days)
resellerClientSchema.statics.getClientsNeedingFollowUp = function(resellerId, daysSinceLastPurchase = 30) {
    const cutoffDate = new Date(Date.now() - daysSinceLastPurchase * 24 * 60 * 60 * 1000);
    return this.find({
        resellerId,
        status: 'active',
        lastPurchaseDate: { $lt: cutoffDate }
    }).sort({ lastPurchaseDate: 1 });
};

// Static method to get client statistics for a reseller
resellerClientSchema.statics.getResellerClientStats = async function(resellerId) {
    const stats = await this.aggregate([
        { $match: { resellerId: new mongoose.Types.ObjectId(resellerId) } },
        {
            $group: {
                _id: null,
                totalClients: { $sum: 1 },
                activeClients: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                totalRevenue: { $sum: '$totalSpent' },
                avgOrderValue: { $avg: '$averageOrderValue' },
                totalOrders: { $sum: '$totalOrders' }
            }
        }
    ]);
    return stats[0] || { totalClients: 0, activeClients: 0, totalRevenue: 0, avgOrderValue: 0, totalOrders: 0 };
};

module.exports = mongoose.model('ResellerClient', resellerClientSchema);
