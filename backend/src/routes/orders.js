const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

// Create order
router.post('/', async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            orderId: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`
        };

        const order = new Order(orderData);
        await order.save();

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single order
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
