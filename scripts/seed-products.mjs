// Database Seed Script for FastGasHub
// Run with: node scripts/seed-products.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    retailPrice: { type: Number, required: true },
    resellerPrice: { type: Number, required: true },
    wholesalePrice: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 20 },
    weight: { type: Number, default: 0 },
    dimensions: {
        height: Number,
        diameter: Number,
    },
    image: { type: String },
    images: [String],
    specifications: { type: Map, of: String },
    features: [String],
    safetyInfo: { type: String },
    certifications: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    totalSold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// FastGas N₂O Products
const products = [
    {
        name: 'FastGas 670g N₂O Cylinder',
        slug: '670g-n2o-cylinder',
        sku: 'FG-670G',
        category: 'cream-charger',
        description: 'Premium 670g N₂O cream charger cylinder for professional culinary use. Perfect for creating whipped cream, mousses, espumas, and other culinary foams. Food-grade certified and trusted by professional chefs across Kenya.',
        shortDescription: 'Premium 670g N₂O cream charger - Food grade certified',
        retailPrice: 7500,
        resellerPrice: 6375,
        wholesalePrice: 5625,
        costPrice: 4500,
        stock: 150,
        lowStockThreshold: 30,
        weight: 0.67,
        dimensions: { height: 32, diameter: 8 },
        image: '/images/fastgas-670g.png',
        images: ['/images/fastgas-670g.png'],
        features: [
            'Premium food-grade N₂O',
            '670g capacity',
            'Compatible with standard regulators',
            'Fast delivery across Kenya',
            'Professional chef approved'
        ],
        safetyInfo: 'For culinary use only. Do not inhale. Store in cool, dry place away from heat sources. Use with compatible dispensers only. Keep out of reach of children.',
        certifications: ['Food Grade Certified', 'KEBS Approved', 'ISO 9001'],
        isActive: true,
        isFeatured: true,
        totalSold: 567,
        rating: 4.8,
        reviewCount: 45,
    },
    {
        name: 'Pressure Regulator',
        slug: 'pressure-regulator',
        sku: 'FG-REG',
        category: 'accessory',
        description: 'Professional pressure regulator designed for use with 670g N₂O cylinders. Precision control for consistent cream dispensing. Durable brass construction with food-safe materials.',
        shortDescription: 'Professional pressure regulator for 670g cylinders',
        retailPrice: 2500,
        resellerPrice: 2125,
        wholesalePrice: 1875,
        costPrice: 1500,
        stock: 80,
        lowStockThreshold: 20,
        weight: 0.3,
        dimensions: { height: 10, diameter: 5 },
        image: '/images/fastgas-regulator.png',
        images: ['/images/fastgas-regulator.png'],
        features: [
            'Precision pressure control',
            'Durable brass construction',
            'Food-safe materials',
            'Compatible with all 670g cylinders',
            '1 year warranty'
        ],
        safetyInfo: 'Check for leaks before each use. Store in dry place.',
        certifications: ['Food Grade Certified', 'CE Marked'],
        isActive: true,
        isFeatured: true,
        totalSold: 298,
        rating: 4.9,
        reviewCount: 32,
    },
    {
        name: 'FastGas Creamer Dispenser',
        slug: 'fastgas-creamer',
        sku: 'FG-CREAMER',
        category: 'equipment',
        description: 'Professional 500ml cream dispenser for restaurants and bakeries. Creates perfectly whipped cream and culinary foams. Stainless steel construction with ergonomic design.',
        shortDescription: 'Professional cream dispenser - 500ml capacity',
        retailPrice: 15000,
        resellerPrice: 12750,
        wholesalePrice: 11250,
        costPrice: 9000,
        stock: 45,
        lowStockThreshold: 15,
        weight: 0.5,
        dimensions: { height: 35, diameter: 10 },
        image: '/images/fastgas-creamer.png',
        images: ['/images/fastgas-creamer.png'],
        features: [
            '500ml capacity',
            'Stainless steel construction',
            'Ergonomic design',
            'Compatible with standard N₂O chargers',
            'Easy to clean',
            '2 year warranty'
        ],
        safetyInfo: 'Do not overfill. Release pressure before opening. Clean after each use.',
        certifications: ['Food Grade Certified', 'FDA Approved Materials'],
        isActive: true,
        isFeatured: true,
        totalSold: 135,
        rating: 4.7,
        reviewCount: 18,
    }
];

async function seed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});

        // Insert products
        console.log('📦 Inserting products...');
        const result = await Product.insertMany(products);
        console.log(`✅ Inserted ${result.length} products`);

        // Display products
        console.log('\n📋 Products in database:');
        for (const product of result) {
            console.log(`   - ${product.name} (${product.sku}) - KES ${product.retailPrice}`);
        }

        console.log('\n🎉 Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
    }
}

seed();
