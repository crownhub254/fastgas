// backend/src/routes/orders.js - UPDATED with rider functionality
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Get orders by tracking ID
router.get('/tracking/:trackingId', async (req, res) => {
    try {
        const order = await Order.findOne({ trackingId: req.params.trackingId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Get order by tracking error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get order'
        });
    }
});

// Get rider's orders
router.get('/rider/:riderId', async (req, res) => {
    try {
        const orders = await Order.find({ riderId: req.params.riderId })
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for rider:`, req.params.riderId);
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

// Get orders pending rider assignment
router.get('/pending-assignment', async (req, res) => {
    try {
        const orders = await Order.find({
            status: 'confirmed',
            riderId: null
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get pending assignment orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Assign rider to order
router.patch('/:orderId/assign-rider', async (req, res) => {
    try {
        const { riderId, riderInfo, assignedBy } = req.body;

        if (!riderId || !riderInfo) {
            return res.status(400).json({
                success: false,
                error: 'Rider ID and rider info are required'
            });
        }

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order already has a rider assigned'
            });
        }

        // Update order
        order.riderId = riderId;
        order.riderInfo = riderInfo;
        order.assignedBy = assignedBy;
        order.assignedAt = new Date();
        order.status = 'assigned';

        // Add timeline event
        if (!order.timeline) {
            order.timeline = [];
        }
        order.timeline.push({
            status: 'assigned',
            timestamp: new Date(),
            location: 'Warehouse',
            note: `Rider ${riderInfo.name} has been assigned to this delivery`
        });

        // Set estimated delivery (3 days from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
        order.estimatedDelivery = estimatedDelivery;

        await order.save();

        console.log('Rider assigned to order:', order.orderId, 'Rider:', riderId);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Assign rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to assign rider'
        });
    }
});

// Accept delivery (rider collects package)
router.patch('/:orderId/accept-delivery', async (req, res) => {
    try {
        const { status, timeline } = req.body;

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.status = status;

        if (timeline) {
            if (!order.timeline) {
                order.timeline = [];
            }
            order.timeline.push(timeline);
        }

        await order.save();

        console.log('Delivery accepted for order:', order.orderId);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Accept delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to accept delivery'
        });
    }
});

// Update delivery status (rider updates progress)
router.patch('/:orderId/update-delivery-status', async (req, res) => {
    try {
        const { status, timeline } = req.body;

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.status = status;

        if (timeline) {
            if (!order.timeline) {
                order.timeline = [];
            }
            order.timeline.push(timeline);
        }

        // If delivered, set actual delivery time and update rider stats
        if (status === 'delivered') {
            order.actualDelivery = new Date();

            // Update rider's completed deliveries count
            if (order.riderId) {
                const rider = await User.findOne({ uid: order.riderId, role: 'rider' });
                if (rider && rider.riderInfo) {
                    rider.riderInfo.completedDeliveries = (rider.riderInfo.completedDeliveries || 0) + 1;
                    await rider.save();
                }
            }
        }

        await order.save();

        console.log('Delivery status updated for order:', order.orderId, 'to', status);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update delivery status'
        });
    }
});

// Create order (UPDATED with tracking ID generation)
router.post('/', async (req, res) => {
    try {
        const { userId, items, paymentMethod, buyerInfo } = req.body;

        // Validate required fields
        if (!userId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (!buyerInfo || !buyerInfo.name || !buyerInfo.email || !buyerInfo.phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Buyer information is required'
            });
        }

        // Generate unique order ID and tracking ID
        const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
        const trackingId = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Check for recent duplicate orders
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentOrder = await Order.findOne({
            userId,
            createdAt: { $gte: fiveMinutesAgo },
            paymentStatus: 'pending',
            status: 'processing'
        }).sort({ createdAt: -1 });

        if (recentOrder) {
            const itemsMatch = JSON.stringify(recentOrder.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity
            })).sort((a, b) => a.productId.localeCompare(b.productId))) ===
                JSON.stringify(items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity
                })).sort((a, b) => a.productId.localeCompare(b.productId)));

            if (itemsMatch) {
                console.log('Duplicate order detected, returning existing order:', recentOrder.orderId);
                return res.status(200).json({
                    success: true,
                    order: recentOrder,
                    message: 'Using existing pending order'
                });
            }
        }

        // Create new order
        const orderData = {
            ...req.body,
            orderId,
            trackingId,
            buyerInfo,
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'completed' : 'pending',
            status: 'processing',
            timeline: req.body.timeline || [{
                status: 'processing',
                timestamp: new Date(),
                location: 'Order Placed',
                note: 'Your order has been received and is being processed'
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const order = new Order(orderData);
        await order.save();

        console.log('New order created:', orderId, 'Tracking ID:', trackingId);
        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
});

// Get all orders (admin only - add to existing routes)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(1000); // Limit to recent 1000 orders

        console.log(`Found ${orders.length} total orders`);
        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Get user orders by userId (Firebase UID)
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for user:`, req.params.userId);
        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Get single order by orderId
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get order'
        });
    }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        const validStatuses = ['processing', 'confirmed', 'assigned', 'collected', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update completed or cancelled orders'
            });
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();
        await order.save();

        console.log('Order status updated:', order.orderId, 'to', status);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update order status'
        });
    }
});

module.exports = router;
