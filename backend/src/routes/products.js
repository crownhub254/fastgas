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
