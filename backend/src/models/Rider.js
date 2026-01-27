const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
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
    provider: {
        type: String,
        enum: ['google', 'email'],
        required: true
    },
    // NID Number
    // nidNumber: {
    //     type: String,
    //     required: true
    // },
    // Rider-specific information
    vehicleType: {
        type: String,
        required: true,
        enum: ['bike', 'bicycle', 'car', 'van']
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    // Address
    address: {
        division: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    // Rider Status
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Stats
    completedDeliveries: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    // Current Assignment
    currentOrderId: {
        type: String,
        default: null
    },
    // Performance Metrics
    onTimeDeliveries: {
        type: Number,
        default: 0
    },
    lateDeliveries: {
        type: Number,
        default: 0
    },
    cancelledDeliveries: {
        type: Number,
        default: 0
    },
    // Earnings History
    earningsHistory: [{
        orderId: String,
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'withdrawn'],
            default: 'completed'
        }
    }],
    // Ratings from customers
    ratings: [{
        orderId: String,
        customerId: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Method to update earnings
riderSchema.methods.addEarning = function (orderId, amount) {
    this.earnings += amount;
    this.earningsHistory.push({
        orderId,
        amount,
        status: 'completed'
    });
    return this.save();
};

// Method to update rating
riderSchema.methods.updateRating = function (newRating, orderId, customerId, comment) {
    this.ratings.push({
        orderId,
        customerId,
        rating: newRating,
        comment
    });

    // Recalculate average rating
    const totalRatings = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.rating = totalRatings / this.ratings.length;
    this.totalRatings = this.ratings.length;

    return this.save();
};

// Method to complete delivery
riderSchema.methods.completeDelivery = function (orderId, amount, onTime = true) {
    this.completedDeliveries += 1;
    if (onTime) {
        this.onTimeDeliveries += 1;
    } else {
        this.lateDeliveries += 1;
    }
    this.currentOrderId = null;
    this.addEarning(orderId, amount);
    return this.save();
};

// Method to accept order
riderSchema.methods.acceptOrder = function (orderId) {
    this.currentOrderId = orderId;
    this.isAvailable = false;
    return this.save();
};

// Method to reject/complete and become available
riderSchema.methods.becomeAvailable = function () {
    this.currentOrderId = null;
    this.isAvailable = true;
    return this.save();
};

// Static method to find available riders by location
riderSchema.statics.findAvailableByLocation = function (division, district) {
    return this.find({
        isAvailable: true,
        isVerified: true,
        'address.division': division,
        'address.district': district
    }).sort({ rating: -1, completedDeliveries: -1 });
};

// Static method to get top riders
riderSchema.statics.getTopRiders = function (limit = 10) {
    return this.find({ isVerified: true })
        .sort({ rating: -1, completedDeliveries: -1 })
        .limit(limit);
};

module.exports = mongoose.model('Rider', riderSchema);
