// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        let query = {};

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Build sort object
        let sortObj = { createdAt: -1 }; // Default: newest first
        if (sort === 'price-asc') sortObj = { price: 1 };
        if (sort === 'price-desc') sortObj = { price: -1 };
        if (sort === 'rating') sortObj = { rating: -1 };
        if (sort === 'name') sortObj = { name: 1 };

        const products = await Product.find(query).sort(sortObj);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get products'
        });
    }
});

// Get single product by ID (supports both custom 'id' and MongoDB '_id')
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        let product;

        // Try to find by custom 'id' field first
        product = await Product.findOne({ id: productId })
            .populate('reviews.userId', 'displayName photoURL');

        // If not found, try MongoDB _id (for ObjectId format)
        if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(productId)
                .populate('reviews.userId', 'displayName photoURL');
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get product'
        });
    }
});

// Create product (seller only)
router.post('/', async (req, res) => {
    try {
        const { name, price, category } = req.body;

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                error: 'Name, price, and category are required'
            });
        }

        // Check for duplicate product
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            category
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                error: 'Product with this name already exists in this category'
            });
        }

        // Generate unique product ID
        const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const product = new Product({
            ...req.body,
            id: productId,
            rating: req.body.rating || 0,
            reviews: req.body.reviews || []
        });

        await product.save();

        console.log('New product created:', productId);
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Create product error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Product with this information already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create product'
        });
    }
});

// Update product
router.patch('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        let product;

        // Try custom id first
        product = await Product.findOne({ id: productId });

        // If not found, try MongoDB _id
        if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(productId);
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Update fields (exclude id and reviews)
        const allowedUpdates = ['name', 'description', 'price', 'image', 'category', 'stock', 'features', 'specifications'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        console.log('Product updated:', product.id || product._id);
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update product'
        });
    }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
    try {
        const { userId, userName, userPhoto, rating, comment } = req.body;

        // Validate required fields
        if (!userId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'UserId and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        const productId = req.params.id;
        let product;

        // Try custom id first
        product = await Product.findOne({ id: productId });

        // If not found, try MongoDB _id
        if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(productId);
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Check if user already reviewed (prevent duplicates)
        const existingReview = product.reviews.find(
            review => review.userId.toString() === userId.toString()
        );

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product'
            });
        }

        // Add new review
        const review = {
            userId,
            userName: userName || 'Anonymous',
            userPhoto: userPhoto || '',
            rating: Number(rating),
            comment: comment || '',
            verified: false,
            date: new Date()
        };

        product.reviews.push(review);

        // Recalculate average rating
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();

        console.log('Review added to product:', product.id || product._id);
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to add review'
        });
    }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        let product;

        // Try custom id first
        product = await Product.findOneAndDelete({ id: productId });

        // If not found, try MongoDB _id
        if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findByIdAndDelete(productId);
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        console.log('Product deleted:', productId);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete product'
        });
    }
});

module.exports = router;
