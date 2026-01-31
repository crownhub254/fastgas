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
        description: 'Premium 670g N₂O cream charger cylinder for professional culinary use. European quality nitrous oxide in a safe and disposable steel canister. Always at full capacity - equivalent to ~80 cream chargers. Perfect for creating whipped cream, mousses, espumas, and other culinary foams.',
        shortDescription: 'Premium 670g N₂O cream charger - Bestselling size worldwide',
        retailPrice: 7500,
        resellerPrice: 6375,
        wholesalePrice: 5625,
        costPrice: 4500,
        stock: 150,
        lowStockThreshold: 30,
        weight: 1.4,
        dimensions: { height: 25.2, diameter: 8 },
        image: 'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_side-view.png',
        images: [
            'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_side-view.png',
            'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_box.png',
            'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_pallet.png'
        ],
        specifications: new Map([
            ['Weight', '1.4 kg'],
            ['Dimensions', '8.0 × 8.0 × 25.2 cm'],
            ['Capacity', '670 grams'],
            ['Gas Type', 'Nitrous Oxide (N₂O)'],
            ['Purity', '99.99% Food Grade'],
            ['Casing', 'Disposable Carbon Steel'],
            ['Valve Type', 'M10X1 Standard'],
            ['UN Number', 'UN.Nr 1070'],
            ['Units Per Case', '6'],
            ['Case Dimensions', '25.5 × 17.5 × 27 cm'],
            ['Case Weight', '12.6 kg']
        ]),
        features: [
            'Bestselling size worldwide',
            'M10X1 standard valve',
            'Carbon steel cylinder',
            '6 units per case',
            'Food-grade N₂O certified',
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
        description: 'Professional pressure regulator designed for use with 670g N₂O cylinders. M10X1 valve compatible with precision control for consistent cream dispensing. Durable brass construction with food-safe materials. Easy syphon attachment for professional setup.',
        shortDescription: 'M10X1 pressure regulator for 670g cylinders',
        retailPrice: 2500,
        resellerPrice: 2125,
        wholesalePrice: 1875,
        costPrice: 1500,
        stock: 80,
        lowStockThreshold: 20,
        weight: 0.3,
        dimensions: { height: 10, diameter: 5 },
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/Pressure-Regulator-transparent.png',
        images: ['https://fast-gas.com/wp-content/uploads/2025/03/Pressure-Regulator-transparent.png'],
        specifications: new Map([
            ['Weight', '0.3 kg'],
            ['Valve Compatibility', 'M10X1 Standard'],
            ['Material', 'Durable Brass Construction'],
            ['Connection Type', 'Standard Syphon Attachment'],
            ['Pressure Control', 'Precision Adjustable'],
            ['Warranty', '1 Year']
        ]),
        features: [
            'M10X1 valve compatible',
            'Precise pressure control',
            'Easy syphon attachment',
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
        description: 'Professional all-in-one cream dispenser with integrated stand and cylinder mount. Features a premium matte black finish and restaurant-grade quality for perfect whipped cream, espumas, sauces, and molecular gastronomy applications.',
        shortDescription: 'Professional cream dispenser with integrated stand',
        retailPrice: 15000,
        resellerPrice: 12750,
        wholesalePrice: 11250,
        costPrice: 9000,
        stock: 45,
        lowStockThreshold: 15,
        weight: 0.5,
        dimensions: { height: 35, diameter: 10 },
        image: 'https://fast-gas.com/wp-content/uploads/2024/06/fg-new-branding-670-original.png',
        images: ['https://fast-gas.com/wp-content/uploads/2024/06/fg-new-branding-670-original.png'],
        specifications: new Map([
            ['Weight', '0.5 kg'],
            ['Dimensions', '10 × 10 × 35 cm'],
            ['Compatibility', 'All N₂O cylinders'],
            ['Finish', 'Premium Matte Black'],
            ['Warranty', '2 Years']
        ]),
        features: [
            'Professional stand mount',
            'Integrated cylinder holder',
            'Premium matte black finish',
            'Restaurant-grade quality',
            'Compatible with all N₂O cylinders',
            '2 year warranty'
        ],
        safetyInfo: 'Do not overfill. Release pressure before opening. Clean after each use.',
        certifications: ['Food Grade Certified', 'FDA Approved Materials'],
        isActive: true,
        isFeatured: true,
        totalSold: 135,
        rating: 4.7,
        reviewCount: 18,
    },
    {
        name: 'FastGas Cream Syphon',
        slug: 'cream-syphon',
        sku: 'FG-SYPHON',
        category: 'equipment',
        description: 'The FastGas cream syphon is designed to dispense the final product: whipped creams, espumas and foams on your culinary or bar creations. Compatible with the FastGas Creamer and the FastGas pressure regulator as well as most industry standards. Only suitable for cold mixtures.',
        shortDescription: 'Professional 0.5L cream syphon for whipped creams, espumas and foams',
        retailPrice: 8500,
        resellerPrice: 7225,
        wholesalePrice: 6375,
        costPrice: 5100,
        stock: 60,
        lowStockThreshold: 15,
        weight: 1.0,
        dimensions: { height: 26, diameter: 8 },
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/3.png',
        images: ['https://fast-gas.com/wp-content/uploads/2025/03/3.png'],
        specifications: new Map([
            ['Weight', '1 kg'],
            ['Nozzle Dimensions', '0.8 × 2.6 cm'],
            ['Capacity', '0.5 Liters (500ml)'],
            ['Compatibility', 'FastGas Creamer, Pressure Regulator, Industry Standard'],
            ['Suitable For', 'Cold Mixtures Only'],
            ['Material', 'Food-Grade Stainless Steel'],
            ['Warranty', '2 Years']
        ]),
        features: [
            'Compatible with FastGas Creamer',
            'Works with Pressure Regulator',
            'Industry standard compatibility',
            'Cold mixtures only',
            'Professional grade quality',
            '0.5L capacity for efficient service',
            'Food-grade stainless steel construction',
            '2 year warranty'
        ],
        safetyInfo: 'For cold mixtures only. Do not use with hot liquids. Release all pressure before opening. Clean after each use. Store in cool, dry place.',
        certifications: ['Food Grade Certified', 'KEBS Approved', 'ISO 9001'],
        isActive: true,
        isFeatured: true,
        totalSold: 89,
        rating: 4.8,
        reviewCount: 24,
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
