const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// Get all riders
router.get('/', async (req, res) => {
    try {
        const riders = await User.find({ role: 'rider' })
            .select('-provider')
            .sort({ 'riderInfo.rating': -1 });

        res.status(200).json({
            success: true,
            count: riders.length,
            users: riders
        });
    } catch (error) {
        console.error('Get riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Get rider by ID
router.get('/:riderId', async (req, res) => {
    try {
        const rider = await User.findOne({
            uid: req.params.riderId,
            role: 'rider'
        });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        res.status(200).json({ success: true, rider });
    } catch (error) {
        console.error('Get rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get rider'
        });
    }
});

// Update rider availability
router.patch('/:riderId/availability', async (req, res) => {
    try {
        const { isAvailable } = req.body;

        const rider = await User.findOne({
            uid: req.params.riderId,
            role: 'rider'
        });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        if (!rider.riderInfo) {
            rider.riderInfo = {};
        }

        rider.riderInfo.isAvailable = isAvailable;
        await rider.save();

        console.log('Rider availability updated:', req.params.riderId, isAvailable);
        res.status(200).json({ success: true, rider });
    } catch (error) {
        console.error('Update rider availability error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update availability'
        });
    }
});

// Update rider location
router.patch('/:riderId/location', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const rider = await User.findOne({
            uid: req.params.riderId,
            role: 'rider'
        });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        if (!rider.riderInfo) {
            rider.riderInfo = {};
        }

        rider.riderInfo.currentLocation = {
            latitude,
            longitude
        };
        await rider.save();

        res.status(200).json({ success: true, rider });
    } catch (error) {
        console.error('Update rider location error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update location'
        });
    }
});

// Get rider statistics
router.get('/:riderId/stats', async (req, res) => {
    try {
        const rider = await User.findOne({
            uid: req.params.riderId,
            role: 'rider'
        });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        // Get delivery statistics
        const totalDeliveries = await Order.countDocuments({
            riderId: req.params.riderId,
            status: 'delivered'
        });

        const pendingDeliveries = await Order.countDocuments({
            riderId: req.params.riderId,
            status: { $in: ['assigned', 'collected', 'in_transit', 'out_for_delivery'] }
        });

        // Get deliveries completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completedToday = await Order.countDocuments({
            riderId: req.params.riderId,
            status: 'delivered',
            actualDelivery: { $gte: today }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalDeliveries,
                pendingDeliveries,
                completedToday,
                rating: rider.riderInfo?.rating || 5.0,
                totalEarnings: totalDeliveries * 5 // $5 per delivery
            }
        });
    } catch (error) {
        console.error('Get rider stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get rider stats'
        });
    }
});

module.exports = router;
