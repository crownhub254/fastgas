const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const User = require('../models/User');
const Order = require('../models/Order');
const { createNotification } = require('../utils/notificationService');

// Register rider (called after rider info form submission)
router.post('/register', async (req, res) => {
    try {
        const {
            uid,
            email,
            displayName,
            phoneNumber,
            photoURL,
            provider,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            address
        } = req.body;

        // Validation
        if (!uid || !email || !displayName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'UID, email, display name, and phone number are required'
            });
        }

        if (!vehicleType || !vehicleNumber || !licenseNumber || !address) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle information and address are required for riders'
            });
        }

        // Check if rider already exists
        let rider = await Rider.findOne({ uid });

        if (rider) {
            // Update existing rider
            rider.email = email;
            rider.displayName = displayName;
            rider.phoneNumber = phoneNumber;
            rider.photoURL = photoURL || rider.photoURL;
            rider.provider = provider;
            rider.vehicleType = vehicleType;
            rider.vehicleNumber = vehicleNumber;
            rider.licenseNumber = licenseNumber;
            rider.address = address;

            await rider.save();
            console.log('✅ Rider updated:', uid);

            return res.status(200).json({
                success: true,
                rider,
                isNewUser: false
            });
        }

        // Create new rider
        rider = new Rider({
            uid,
            email,
            displayName,
            phoneNumber,
            photoURL: photoURL || '',
            provider: provider || 'email',
            vehicleType,
            vehicleNumber,
            licenseNumber,
            address,
            isAvailable: true,
            isVerified: false, // Admin needs to verify
            completedDeliveries: 0,
            rating: 5.0,
            totalRatings: 0,
            earnings: 0
        });

        await rider.save();
        console.log('✅ New rider created:', uid);

        // Create a corresponding user record with role 'rider'
        try {
            const user = new User({
                uid,
                email,
                displayName,
                phoneNumber,
                photoURL: photoURL || '',
                role: 'rider',
                provider: provider || 'email'
            });
            await user.save();
            console.log('✅ User record created for rider:', uid);
        } catch (userError) {
            console.error('❌ Failed to create user record:', userError);
            // Continue even if user creation fails
        }

        // Send welcome notification (non-blocking)
        setImmediate(async () => {
            try {
                await createNotification({
                    userId: uid,
                    type: 'account_created',
                    title: '🎉 Welcome to ShopHub Delivery!',
                    message: 'Your rider account has been created. Please wait for admin verification to start accepting deliveries.',
                    data: { riderId: uid },
                    link: '/dashboard/rider',
                    icon: 'CheckCircle',
                    priority: 'high'
                });
            } catch (notifError) {
                console.error('Notification error:', notifError);
            }
        });

        res.status(201).json({
            success: true,
            rider,
            isNewUser: true
        });
    } catch (error) {
        console.error('❌ Rider registration error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Rider with this email or UID already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to register rider'
        });
    }
});

// Get all available riders (optionally filter by location)
router.get('/available', async (req, res) => {
    try {
        const { division, district } = req.query;

        let query = {
            isAvailable: true,
            isVerified: true
        };

        if (division) {
            query['address.division'] = division;
        }
        if (district) {
            query['address.district'] = district;
        }

        const riders = await Rider.find(query)
            .select('uid displayName phoneNumber photoURL vehicleType vehicleNumber rating completedDeliveries address')
            .sort({ rating: -1, completedDeliveries: -1 });

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('Get available riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Get all riders (Admin)
router.get('/', async (req, res) => {
    try {
        const { verified, available } = req.query;
        let query = {};

        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }
        if (available !== undefined) {
            query.isAvailable = available === 'true';
        }

        const riders = await Rider.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('Get riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Get rider by UID
router.get('/:uid', async (req, res) => {
    try {
        const rider = await Rider.findOne({ uid: req.params.uid });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        res.status(200).json({
            success: true,
            rider
        });
    } catch (error) {
        console.error('Get rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get rider'
        });
    }
});

// Update rider verification status (Admin)
router.patch('/:uid/verify', async (req, res) => {
    try {
        const { isVerified } = req.body;

        const rider = await Rider.findOne({ uid: req.params.uid });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        rider.isVerified = isVerified;
        await rider.save();

        // Notify rider
        if (isVerified) {
            await createNotification({
                userId: rider.uid,
                type: 'general',
                title: '✅ Account Verified!',
                message: 'Your rider account has been verified. You can now start accepting deliveries.',
                data: { riderId: rider.uid },
                link: '/dashboard/rider',
                icon: 'CheckCircle',
                priority: 'high'
            });
        }

        res.status(200).json({
            success: true,
            rider
        });
    } catch (error) {
        console.error('Verify rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify rider'
        });
    }
});

// Assign rider to order
router.post('/assign', async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        if (!rider.isVerified) {
            return res.status(400).json({
                success: false,
                error: 'Rider is not verified'
            });
        }

        if (!rider.isAvailable) {
            return res.status(400).json({
                success: false,
                error: 'Rider is not available'
            });
        }

        // Assign rider to order
        await rider.acceptOrder(orderId);

        // Update order
        order.riderId = riderId;
        order.riderInfo = {
            name: rider.displayName,
            phone: rider.phoneNumber,
            vehicleType: rider.vehicleType,
            vehicleNumber: rider.vehicleNumber,
            rating: rider.rating
        };
        order.riderStatus = 'pending';
        order.riderAssignedAt = new Date();
        order.status = 'confirmed';
        order.deliveryFee = 50;

        if (!order.trackingId) {
            order.trackingId = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }

        await order.save();

        // Notify rider
        await createNotification({
            userId: riderId,
            type: 'new_order',
            title: '🚚 New Delivery Assignment',
            message: `You have been assigned to deliver order #${orderId}. Check details and accept the delivery.`,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId,
                deliveryFee: order.deliveryFee
            },
            link: `/dashboard/rider/my-tasks`,
            icon: 'Package',
            priority: 'high'
        });

        res.status(200).json({
            success: true,
            message: 'Rider assigned successfully',
            order
        });
    } catch (error) {
        console.error('Assign rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to assign rider'
        });
    }
});

// Rider accepts delivery
router.post('/accept-delivery', async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        const rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        if (order.riderStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Cannot accept order with status: ${order.riderStatus}`
            });
        }

        // Update order status
        order.riderStatus = 'accepted';
        order.riderAcceptedAt = new Date();
        order.status = 'shipped';
        await order.save();

        // Notify customer
        await createNotification({
            userId: order.userId,
            type: 'order_shipped',
            title: '📦 Your Order is On the Way!',
            message: `${rider.displayName} has accepted your delivery. Track your order with ID: ${order.trackingId}`,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId,
                riderName: rider.displayName,
                riderPhone: rider.phoneNumber
            },
            link: `/orders/${order.orderId}`,
            icon: 'Truck',
            priority: 'high'
        });

        res.status(200).json({
            success: true,
            message: 'Delivery accepted successfully',
            order
        });
    } catch (error) {
        console.error('Accept delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to accept delivery'
        });
    }
});

// Rider rejects delivery
router.post('/reject-delivery', async (req, res) => {
    try {
        const { orderId, riderId, reason } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        const rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        // Make rider available again
        await rider.becomeAvailable();

        // Clear rider assignment from order
        order.riderId = null;
        order.riderInfo = {};
        order.riderStatus = 'pending';
        order.riderAssignedAt = null;
        order.status = 'confirmed';
        await order.save();

        // Notify customer
        await createNotification({
            userId: order.userId,
            type: 'general',
            title: '⚠️ Delivery Assignment Changed',
            message: `The assigned rider declined your delivery. We're finding another rider for you.`,
            data: {
                orderId: order.orderId,
                reason: reason || 'Not specified'
            },
            link: `/orders/${order.orderId}`,
            icon: 'AlertCircle',
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: 'Delivery rejected',
            order
        });
    } catch (error) {
        console.error('Reject delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to reject delivery'
        });
    }
});

// Complete delivery
router.post('/complete-delivery', async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        const rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        // Update order status
        order.riderStatus = 'delivered';
        order.deliveredAt = new Date();
        order.status = 'delivered';
        await order.save();

        // Calculate if delivery was on time
        const assignedTime = new Date(order.riderAssignedAt);
        const deliveredTime = new Date(order.deliveredAt);
        const timeDiff = (deliveredTime - assignedTime) / (1000 * 60 * 60);
        const onTime = timeDiff <= 48;

        // Update rider stats and earnings
        const deliveryFee = order.deliveryFee || 50;
        await rider.completeDelivery(orderId, deliveryFee, onTime);

        // Notify customer
        await createNotification({
            userId: order.userId,
            type: 'order_delivered',
            title: '🎉 Order Delivered Successfully!',
            message: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId
            },
            link: `/orders/${order.orderId}`,
            icon: 'CheckCircle',
            priority: 'high'
        });

        // Notify rider of earnings
        await createNotification({
            userId: riderId,
            type: 'general',
            title: '💰 Delivery Completed!',
            message: `You earned ৳${deliveryFee} for completing order #${orderId}. Total earnings: ৳${rider.earnings}`,
            data: {
                orderId: order.orderId,
                earnings: deliveryFee,
                totalEarnings: rider.earnings
            },
            link: `/dashboard/rider/income`,
            icon: 'DollarSign',
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: 'Delivery completed successfully',
            order,
            earnings: {
                amount: deliveryFee,
                total: rider.earnings
            }
        });
    } catch (error) {
        console.error('Complete delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to complete delivery'
        });
    }
});

// Get rider's orders
router.get('/:riderId/orders', async (req, res) => {
    try {
        const { riderId } = req.params;
        const { status } = req.query;

        let query = { riderId };
        if (status && status !== 'all') {
            query.riderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ riderAssignedAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get rider orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Get rider earnings
router.get('/:riderId/earnings', async (req, res) => {
    try {
        const { riderId } = req.params;

        const rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        res.status(200).json({
            success: true,
            earnings: {
                total: rider.earnings,
                deliveries: rider.completedDeliveries,
                average: rider.completedDeliveries > 0
                    ? (rider.earnings / rider.completedDeliveries).toFixed(2)
                    : 0,
                rating: rider.rating,
                onTimeRate: rider.completedDeliveries > 0
                    ? ((rider.onTimeDeliveries / rider.completedDeliveries) * 100).toFixed(1)
                    : 100
            },
            earningsHistory: rider.earningsHistory.slice(-10).reverse()
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get earnings'
        });
    }
});

module.exports = router;
