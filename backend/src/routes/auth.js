// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register or update user from Firebase
router.post('/register', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL, role, provider } = req.body;

        let user = await User.findOne({ uid });

        if (user) {
            // Update existing user
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            await user.save();
        } else {
            // Create new user
            user = new User({
                uid,
                email,
                displayName,
                photoURL: photoURL || '',
                role: role || 'user',
                provider: provider || 'email'
            });
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let query = {};

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id }).populate('reviews.userId', 'displayName photoURL');
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create product (seller only)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
    try {
        const { userId, userName, userPhoto, rating, comment } = req.body;
        const product = await Product.findOne({ id: req.params.id });

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const review = {
            userId,
            userName,
            userPhoto,
            rating,
            comment,
            verified: false,
            date: new Date()
        };

        product.reviews.push(review);

        // Update average rating
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

// backend/src/routes/orders.js
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
