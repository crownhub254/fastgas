const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Create payment intent
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, orderId, currency = 'usd' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: { orderId }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
    try {
        const { orderId, transactionId, amount, paymentMethod } = req.body;

        // Save payment record
        const payment = new Payment({
            orderId,
            transactionId,
            amount,
            status: 'succeeded',
            paymentMethod,
            currency: 'usd'
        });
        await payment.save();

        // Update order
        const order = await Order.findOne({ orderId });
        if (order) {
            order.paymentStatus = 'completed';
            order.transactionId = transactionId;
            await order.save();
        }

        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
