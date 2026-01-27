const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// Helper function to send notifications to all relevant parties
async function sendOrderStatusNotifications(order, status, riderId, riderName) {
    const NotificationService = require('../utils/notificationService');

    const statusConfig = {
        accepted: {
            customer: {
                title: '📦 Your Order is On the Way!',
                message: `${riderName} has accepted your delivery. Track your order with ID: ${order.trackingId}`,
                icon: 'Truck',
                type: 'order_shipped'
            },
            admin: {
                title: '🚚 Delivery Accepted by Rider',
                message: `Rider ${riderName} has accepted delivery for order ${order.orderId}`,
                icon: 'CheckCircle',
                type: 'general'
            },
            seller: {
                title: '📦 Your Product is Out for Delivery',
                message: `Rider ${riderName} has accepted delivery for order ${order.orderId} containing your product(s)`,
                icon: 'Package',
                type: 'general'
            }
        },
        picked_up: {
            customer: {
                title: '📦 Package Picked Up',
                message: `Your order #${order.orderId} has been picked up by the delivery rider.`,
                icon: 'Package',
                type: 'general'
            },
            admin: {
                title: '📦 Package Picked Up',
                message: `Rider ${riderName} has picked up order ${order.orderId}`,
                icon: 'Package',
                type: 'general'
            },
            seller: {
                title: '📦 Your Product Has Been Picked Up',
                message: `Order ${order.orderId} has been picked up and is on its way to the customer`,
                icon: 'Package',
                type: 'general'
            }
        },
        in_transit: {
            customer: {
                title: '🚚 Order In Transit',
                message: `Your order #${order.orderId} is on its way to you!`,
                icon: 'Truck',
                type: 'general'
            },
            admin: {
                title: '🚚 Order In Transit',
                message: `Order ${order.orderId} is in transit with rider ${riderName}`,
                icon: 'Truck',
                type: 'general'
            },
            seller: {
                title: '🚚 Your Product is In Transit',
                message: `Order ${order.orderId} is on its way to the customer`,
                icon: 'Truck',
                type: 'general'
            }
        },
        delivered: {
            customer: {
                title: '🎉 Order Delivered Successfully!',
                message: `Your order #${order.orderId} has been delivered. Enjoy your purchase!`,
                icon: 'CheckCircle',
                type: 'order_delivered'
            },
            admin: {
                title: '✅ Order Delivered',
                message: `Order ${order.orderId} has been successfully delivered by ${riderName}`,
                icon: 'CheckCircle',
                type: 'general'
            },
            seller: {
                title: '✅ Your Product Has Been Delivered',
                message: `Order ${order.orderId} has been successfully delivered to the customer`,
                icon: 'CheckCircle',
                type: 'general'
            }
        }
    };

    const config = statusConfig[status];
    if (!config) {
        console.log(`No notification config for status: ${status}`);
        return;
    }

    try {
        // 1. Notify customer
        await NotificationService.createNotification({
            userId: order.userId,
            type: config.customer.type,
            title: config.customer.title,
            message: config.customer.message,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId,
                riderId: riderId,
                riderName: riderName
            },
            link: `/orders/${order.orderId}`,
            icon: config.customer.icon,
            priority: 'high'
        });
        console.log('✅ Customer notification sent');

        // 2. Notify all admins
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await NotificationService.createNotification({
                userId: admin.uid,
                type: config.admin.type,
                title: config.admin.title,
                message: config.admin.message,
                data: {
                    orderId: order.orderId,
                    trackingId: order.trackingId,
                    riderId: riderId,
                    riderName: riderName
                },
                link: `/dashboard/admin/orders`,
                icon: config.admin.icon,
                priority: 'medium'
            });
        }
        console.log(`✅ Admin notifications sent to ${admins.length} admin(s)`);

        // 3. Notify sellers of products in this order
        const sellerIds = new Set();
        for (const item of order.items) {
            try {
                const product = await Product.findOne({ id: item.productId });
                if (product && product.userId) {
                    sellerIds.add(product.userId);
                }
            } catch (productError) {
                console.error(`Failed to find product ${item.productId}:`, productError);
            }
        }

        for (const sellerId of sellerIds) {
            await NotificationService.createNotification({
                userId: sellerId,
                type: config.seller.type,
                title: config.seller.title,
                message: config.seller.message,
                data: {
                    orderId: order.orderId,
                    trackingId: order.trackingId,
                    riderId: riderId,
                    riderName: riderName
                },
                link: `/dashboard/seller/orders`,
                icon: config.seller.icon,
                priority: 'medium'
            });
        }
        console.log(`✅ Seller notifications sent to ${sellerIds.size} seller(s)`);

    } catch (notifError) {
        console.error('❌ Error sending notifications:', notifError);
    }
}

// Get all available riders (optionally filter by location)
router.get('/available', async (req, res) => {
    try {
        const { division, district } = req.query;

        console.log('📍 Fetching riders with params:', { division, district });

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

        console.log('🔍 Query:', JSON.stringify(query, null, 2));

        const riders = await Rider.find(query)
            .select('uid displayName phoneNumber photoURL vehicleType vehicleNumber licenseNumber rating completedDeliveries address isAvailable isVerified')
            .sort({ rating: -1, completedDeliveries: -1 });

        console.log(`✅ Found ${riders.length} riders`);

        // Log first rider for debugging
        if (riders.length > 0) {
            console.log('Sample rider:', {
                name: riders[0].displayName,
                location: riders[0].address,
                isAvailable: riders[0].isAvailable,
                isVerified: riders[0].isVerified
            });
        }

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('❌ Get available riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Get all riders (Admin - no filtering)
router.get('/', async (req, res) => {
    try {
        const { verified, available } = req.query;

        console.log('📍 Fetching all riders with params:', { verified, available });

        let query = {};

        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }
        if (available !== undefined) {
            query.isAvailable = available === 'true';
        }

        const riders = await Rider.find(query)
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${riders.length} total riders`);

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('❌ Get riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Get all unverified riders (Admin)
router.get('/unverified', async (req, res) => {
    try {
        console.log('📍 Fetching unverified riders');

        const riders = await Rider.find({ isVerified: false })
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${riders.length} unverified riders`);

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('❌ Get unverified riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get unverified riders'
        });
    }
});

// Verify single rider (Admin)
router.patch('/:uid/verify', async (req, res) => {
    try {
        const { uid } = req.params;
        const { isVerified } = req.body;

        console.log(`🔐 Verifying rider: ${uid}, status: ${isVerified}`);

        const rider = await Rider.findOne({ uid });

        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        rider.isVerified = isVerified !== undefined ? isVerified : true;
        await rider.save();

        console.log(`✅ Rider ${rider.displayName} verification updated to: ${rider.isVerified}`);

        // Send notification to rider
        if (rider.isVerified) {
            try {
                await createNotification({
                    userId: uid,
                    type: 'general',
                    title: '✅ Account Verified!',
                    message: 'Congratulations! Your rider account has been verified. You can now start accepting delivery requests.',
                    data: { riderId: uid },
                    link: '/dashboard/rider',
                    icon: 'CheckCircle',
                    priority: 'high'
                });
            } catch (notifError) {
                console.error('Notification error:', notifError);
            }
        }

        res.status(200).json({
            success: true,
            message: `Rider ${rider.isVerified ? 'verified' : 'unverified'} successfully`,
            rider
        });
    } catch (error) {
        console.error('❌ Verify rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify rider'
        });
    }
});

// Verify ALL riders at once (Admin - for testing)
router.post('/verify-all', async (req, res) => {
    try {
        console.log('🔐 Verifying all riders...');

        const result = await Rider.updateMany(
            { isVerified: false },
            {
                $set: {
                    isVerified: true,
                    isAvailable: true
                }
            }
        );

        console.log(`✅ Verified ${result.modifiedCount} riders`);

        res.status(200).json({
            success: true,
            message: `Successfully verified ${result.modifiedCount} riders`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Verify all riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify riders'
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
        order.deliveryFee = 50; // Default delivery fee

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

        console.log('🔄 Accept delivery request:', { orderId, riderId });

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        // Find the order - should already be assigned to this rider
        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            console.error('❌ Order not found or not assigned to rider:', { orderId, riderId });
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        console.log('✅ Order found:', {
            orderId: order.orderId,
            currentStatus: order.riderStatus,
            riderId: order.riderId
        });

        // Check current status - can only accept if pending
        if (order.riderStatus !== 'pending') {
            console.error('❌ Cannot accept order with status:', order.riderStatus);
            return res.status(400).json({
                success: false,
                error: `Cannot accept order with status: ${order.riderStatus}. Only orders with 'pending' status can be accepted.`
            });
        }

        // Try to find rider in Rider collection first
        let rider = await Rider.findOne({ uid: riderId });

        // If not found in Rider collection, check User collection with role='rider'
        if (!rider) {
            console.log('⚠️ Rider not found in Rider collection, checking User collection...');
            const userRider = await User.findOne({ uid: riderId, role: 'rider' });

            if (!userRider) {
                console.error('❌ Rider not found in either collection:', riderId);
                return res.status(404).json({
                    success: false,
                    error: 'Rider not found. Please ensure your rider account is properly registered.'
                });
            }

            // Create a temporary rider object from User data
            rider = {
                uid: userRider.uid,
                displayName: userRider.displayName,
                phoneNumber: userRider.phoneNumber,
                email: userRider.email
            };

            console.log('✅ Found rider in User collection:', rider.displayName);
        } else {
            console.log('✅ Found rider in Rider collection:', rider.displayName);
        }

        // Update order status
        order.riderStatus = 'accepted';
        order.riderAcceptedAt = new Date();
        order.status = 'shipped'; // Overall order status
        await order.save();

        console.log('✅ Order status updated to accepted');

        // Send notifications to all parties (non-blocking)
        setImmediate(async () => {
            await sendOrderStatusNotifications(order, 'accepted', riderId, rider.displayName);
        });

        res.status(200).json({
            success: true,
            message: 'Delivery accepted successfully',
            order
        });
    } catch (error) {
        console.error('❌ Accept delivery error:', error);
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

// ============================================================================
// UPDATE DELIVERY STATUS - Main endpoint for all status transitions
// ============================================================================
router.patch('/update-status', async (req, res) => {
    try {
        const { orderId, riderId, orderStatus, riderStatus, statusLabel } = req.body;

        console.log('🔄 Status update request:', {
            orderId,
            riderId,
            orderStatus,
            riderStatus,
            statusLabel
        });

        // Validate required fields
        if (!orderId || !riderId || !riderStatus) {
            return res.status(400).json({
                success: false,
                error: 'Order ID, Rider ID, and rider status are required'
            });
        }

        // Find the order
        const order = await Order.findOne({ orderId, riderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        // Validate the status transition
        const validTransitions = {
            'pending': ['accepted', 'cancelled'],
            'accepted': ['picked_up', 'cancelled'],
            'picked_up': ['in_transit', 'cancelled'],
            'in_transit': ['delivered', 'cancelled'],
            'delivered': [],
            'cancelled': []
        };

        const currentStatus = order.riderStatus;
        const allowedStatuses = validTransitions[currentStatus] || [];

        if (!allowedStatuses.includes(riderStatus)) {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from ${currentStatus} to ${riderStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`
            });
        }

        // Get rider info
        let rider = await Rider.findOne({ uid: riderId });
        if (!rider) {
            const userRider = await User.findOne({ uid: riderId, role: 'rider' });
            if (userRider) {
                rider = {
                    displayName: userRider.displayName,
                    phoneNumber: userRider.phoneNumber
                };
            }
        }

        // Update order statuses
        order.riderStatus = riderStatus;
        order.status = orderStatus || order.status;

        // Update timestamps based on status
        if (riderStatus === 'picked_up') {
            order.pickedUpAt = new Date();
            console.log(`📦 Order ${orderId} picked up at ${order.pickedUpAt}`);
        } else if (riderStatus === 'delivered') {
            order.deliveredAt = new Date();
            order.status = 'delivered';
            console.log(`✅ Order ${orderId} delivered at ${order.deliveredAt}`);

            // Update rider stats if delivered
            try {
                const riderDoc = await Rider.findOne({ uid: riderId });
                if (riderDoc) {
                    // Calculate if delivery was on time
                    const assignedTime = new Date(order.riderAssignedAt);
                    const deliveredTime = new Date(order.deliveredAt);
                    const timeDiff = (deliveredTime - assignedTime) / (1000 * 60 * 60); // hours
                    const onTime = timeDiff <= 48; // 2 days

                    // Update rider stats and earnings
                    const deliveryFee = order.deliveryFee || 50;
                    await riderDoc.completeDelivery(orderId, deliveryFee, onTime);

                    console.log(`✅ Rider stats updated for ${riderDoc.displayName}. Earnings: $${riderDoc.earnings}`);
                }
            } catch (riderError) {
                console.error('❌ Failed to update rider stats:', riderError);
                // Continue even if rider update fails
            }

            // Update product stock when delivered
            for (const item of order.items) {
                try {
                    const product = await Product.findOne({ id: item.productId });
                    if (product) {
                        product.stock = Math.max(0, product.stock - item.quantity);
                        await product.save();
                        console.log(`✅ Updated stock for product ${item.productId}: ${product.stock}`);
                    }
                } catch (productError) {
                    console.error(`❌ Failed to update stock for product ${item.productId}:`, productError);
                    // Continue even if stock update fails
                }
            }
        }

        // Add timeline entry
        if (!order.timeline) {
            order.timeline = [];
        }

        order.timeline.push({
            status: riderStatus,
            timestamp: new Date(),
            location: 'Updated by rider',
            note: `Order marked as ${statusLabel || riderStatus}`
        });

        // Save the order
        await order.save();

        console.log(`✅ Order ${orderId} status updated: ${currentStatus} → ${riderStatus}`);

        // Send notifications to all parties (non-blocking)
        setImmediate(async () => {
            const riderName = rider ? rider.displayName : 'Delivery Rider';
            await sendOrderStatusNotifications(order, riderStatus, riderId, riderName);

            // If delivered, also notify rider of earnings
            if (riderStatus === 'delivered') {
                try {
                    const deliveryFee = order.deliveryFee || 50;
                    const riderDoc = await Rider.findOne({ uid: riderId });

                    await createNotification({
                        userId: riderId,
                        type: 'general',
                        title: '💰 Delivery Completed!',
                        message: `You earned $${deliveryFee} for completing order #${orderId}. Total earnings: $${riderDoc?.earnings || 0}`,
                        data: {
                            orderId: order.orderId,
                            earnings: deliveryFee,
                            totalEarnings: riderDoc?.earnings || 0
                        },
                        link: `/dashboard/rider/income`,
                        icon: 'DollarSign',
                        priority: 'medium'
                    });
                    console.log('✅ Rider earnings notification sent');
                } catch (notifError) {
                    console.error('❌ Rider notification error:', notifError);
                }
            }
        });

        res.status(200).json({
            success: true,
            message: `Order status updated to ${statusLabel || riderStatus}`,
            order
        });

    } catch (error) {
        console.error('❌ Update status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update status'
        });
    }
});

// Register new rider (separate from users)
router.post('/register', async (req, res) => {
    try {
        const {
            uid,
            email,
            displayName,
            phoneNumber,
            photoURL,
            provider,
            nidNumber,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            address
        } = req.body;

        console.log('📝 Rider registration request:', {
            uid,
            email,
            displayName,
            hasNidNumber: !!nidNumber,
            hasAddress: !!address
        });

        // Validate required fields
        if (!uid || !email || !displayName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'UID, email, display name, and phone number are required'
            });
        }

        if (!nidNumber) {
            return res.status(400).json({
                success: false,
                error: 'NID number is required'
            });
        }

        if (!vehicleType || !vehicleNumber || !licenseNumber) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle type, vehicle number, and license number are required'
            });
        }

        if (!address || !address.division || !address.district || !address.area || !address.street) {
            return res.status(400).json({
                success: false,
                error: 'Complete address (division, district, area, street) is required'
            });
        }

        // Check if rider already exists
        let rider = await Rider.findOne({ uid });

        if (rider) {
            console.log('⚠️ Rider already exists, updating:', uid);

            // Update existing rider
            rider.email = email;
            rider.displayName = displayName;
            rider.phoneNumber = phoneNumber;
            rider.photoURL = photoURL || rider.photoURL;
            rider.provider = provider;
            rider.nidNumber = nidNumber;
            rider.vehicleType = vehicleType;
            rider.vehicleNumber = vehicleNumber;
            rider.licenseNumber = licenseNumber;
            rider.address = address;

            await rider.save();
            console.log('✅ Rider updated successfully');

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
            nidNumber,
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
            // Check if user already exists
            const existingUser = await User.findOne({ uid });

            if (!existingUser) {
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
            } else {
                console.log('ℹ️ User record already exists for rider:', uid);
            }
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

// Complete delivery (legacy endpoint - kept for backward compatibility)
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
        const timeDiff = (deliveredTime - assignedTime) / (1000 * 60 * 60); // hours
        const onTime = timeDiff <= 48; // 2 days

        // Update rider stats and earnings
        const deliveryFee = order.deliveryFee || 50;
        await rider.completeDelivery(orderId, deliveryFee, onTime);

        // Update product stock
        for (const item of order.items) {
            try {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    product.stock = Math.max(0, product.stock - item.quantity);
                    await product.save();
                    console.log(`✅ Updated stock for product ${item.productId}: ${product.stock}`);
                }
            } catch (productError) {
                console.error(`❌ Failed to update stock for product ${item.productId}:`, productError);
            }
        }

        // Send notifications (non-blocking)
        setImmediate(async () => {
            await sendOrderStatusNotifications(order, 'delivered', riderId, rider.displayName);

            // Notify rider of earnings
            await createNotification({
                userId: riderId,
                type: 'general',
                title: '💰 Delivery Completed!',
                message: `You earned $${deliveryFee} for completing order #${orderId}. Total earnings: $${rider.earnings}`,
                data: {
                    orderId: order.orderId,
                    earnings: deliveryFee,
                    totalEarnings: rider.earnings
                },
                link: `/dashboard/rider/income`,
                icon: 'DollarSign',
                priority: 'medium'
            });
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
