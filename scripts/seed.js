// scripts/seed.js
// Run this script to seed the database with initial data
// Usage: node scripts/seed.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastgas';

// User Schema (matching backend/src/models/User.js)
const resellerProfileSchema = new mongoose.Schema({
    businessName: String,
    businessRegistrationNumber: String,
    businessLocation: {
        address: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' }
    },
    commissionRate: { type: Number, default: 10 },
    priceTier: { type: String, enum: ['standard', 'premium', 'wholesale'], default: 'standard' },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    currentStockLevel: { type: Number, default: 0 },
    activeClients: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    documents: [{
        type: { type: String, enum: ['id', 'business_permit', 'tax_certificate', 'other'] },
        url: String,
        verified: { type: Boolean, default: false }
    }],
    mpesaPhone: String,
    adminNotes: String
});

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    photoURL: { type: String, default: '' },
    role: { type: String, enum: ['user', 'customer', 'reseller', 'seller', 'rider', 'admin'], default: 'user' },
    provider: { type: String, enum: ['google', 'email', 'phone'], required: true },
    resellerProfile: resellerProfileSchema,
    referredByReseller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    defaultAddress: {
        street: String,
        city: String,
        county: String,
        country: { type: String, default: 'Kenya' }
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date
}, { timestamps: true });

// Product Schema (matching backend/src/models/Product.js)
const cylinderVariantSchema = new mongoose.Schema({
    size: { type: String, required: true, enum: ['6kg', '13kg', '25kg', '50kg'] },
    sku: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    resellerPrice: { type: Number, required: true },
    wholesalePrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    weight: { type: Number, required: true },
    dimensions: { height: Number, diameter: Number },
    isActive: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'FastGas Cylinder' },
    description: { type: String, required: true },
    brand: { type: String, default: 'FastGas' },
    productType: { type: String, enum: ['gas-cylinder'], default: 'gas-cylinder' },
    gasType: { type: String, enum: ['LPG', 'Propane', 'Butane', 'Mixed'], default: 'LPG' },
    image: { type: String, required: true },
    images: [String],
    variants: [cylinderVariantSchema],
    safetyInfo: String,
    certifications: [String],
    features: [String],
    specifications: {
        gasComposition: String,
        pressureRating: String,
        valveType: String,
        material: String,
        warranty: String
    },
    rating: { type: Number, default: 0 },
    reviews: [{
        userId: String,
        userName: String,
        userPhoto: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        verified: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }],
    totalSold: { type: Number, default: 0 },
    totalResellerSales: { type: Number, default: 0 },
    totalClientSales: { type: Number, default: 0 },
    createdBy: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// Test Users Data
const testUsers = [
    {
        uid: 'admin-001',
        email: 'admin@fastgas.co.ke',
        displayName: 'FastGas Admin',
        phoneNumber: '+254700000001',
        role: 'admin',
        provider: 'email',
        defaultAddress: {
            street: 'Industrial Area',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true
    },
    {
        uid: 'reseller-001',
        email: 'reseller@fastgas.co.ke',
        displayName: 'John Kamau',
        phoneNumber: '+254700000002',
        role: 'reseller',
        provider: 'email',
        resellerProfile: {
            businessName: 'Kamau Gas Supplies',
            businessRegistrationNumber: 'BN123456',
            businessLocation: {
                address: 'Kenyatta Avenue',
                city: 'Nairobi',
                county: 'Nairobi',
                country: 'Kenya'
            },
            commissionRate: 10,
            priceTier: 'standard',
            totalSales: 150,
            totalRevenue: 225000,
            totalCommissionEarned: 22500,
            currentStockLevel: 25,
            activeClients: 12,
            totalOrders: 45,
            averageOrderValue: 5000,
            isApproved: true,
            approvedAt: new Date(),
            mpesaPhone: '+254700000002'
        },
        defaultAddress: {
            street: 'Kenyatta Avenue',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true
    },
    {
        uid: 'reseller-002',
        email: 'reseller2@fastgas.co.ke',
        displayName: 'Mary Wanjiku',
        phoneNumber: '+254700000003',
        role: 'reseller',
        provider: 'email',
        resellerProfile: {
            businessName: 'Wanjiku Energy Solutions',
            businessRegistrationNumber: 'BN789012',
            businessLocation: {
                address: 'Moi Avenue',
                city: 'Mombasa',
                county: 'Mombasa',
                country: 'Kenya'
            },
            commissionRate: 12,
            priceTier: 'premium',
            totalSales: 280,
            totalRevenue: 420000,
            totalCommissionEarned: 50400,
            currentStockLevel: 40,
            activeClients: 25,
            totalOrders: 78,
            averageOrderValue: 5385,
            isApproved: true,
            approvedAt: new Date(),
            mpesaPhone: '+254700000003'
        },
        defaultAddress: {
            street: 'Moi Avenue',
            city: 'Mombasa',
            county: 'Mombasa',
            country: 'Kenya'
        },
        isActive: true
    },
    {
        uid: 'user-001',
        email: 'customer@fastgas.co.ke',
        displayName: 'Peter Ochieng',
        phoneNumber: '+254700000004',
        role: 'user',
        provider: 'email',
        defaultAddress: {
            street: 'Oginga Odinga Street',
            city: 'Kisumu',
            county: 'Kisumu',
            country: 'Kenya'
        },
        isActive: true
    },
    {
        uid: 'user-002',
        email: 'customer2@fastgas.co.ke',
        displayName: 'Grace Muthoni',
        phoneNumber: '+254700000005',
        role: 'user',
        provider: 'email',
        defaultAddress: {
            street: 'Kenyatta Highway',
            city: 'Nakuru',
            county: 'Nakuru',
            country: 'Kenya'
        },
        isActive: true
    },
    {
        uid: 'rider-001',
        email: 'rider@fastgas.co.ke',
        displayName: 'David Kiprop',
        phoneNumber: '+254700000006',
        role: 'rider',
        provider: 'email',
        defaultAddress: {
            street: 'Uhuru Highway',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true
    }
];

// FastGas Product Data
const fastGasProduct = {
    name: 'FastGas LPG Cylinder',
    description: 'Premium quality FastGas LPG cylinder for cooking and industrial use. Our cylinders are built to the highest safety standards and come with a warranty. Perfect for homes, restaurants, and businesses across Kenya.',
    brand: 'FastGas',
    productType: 'gas-cylinder',
    gasType: 'LPG',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
    images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ],
    variants: [
        {
            size: '6kg',
            sku: 'FG-6KG-001',
            retailPrice: 1500,
            resellerPrice: 1200,
            wholesalePrice: 1000,
            stock: 500,
            weight: 6,
            dimensions: { height: 35, diameter: 25 },
            isActive: true
        },
        {
            size: '13kg',
            sku: 'FG-13KG-001',
            retailPrice: 2800,
            resellerPrice: 2400,
            wholesalePrice: 2100,
            stock: 350,
            weight: 13,
            dimensions: { height: 50, diameter: 30 },
            isActive: true
        },
        {
            size: '25kg',
            sku: 'FG-25KG-001',
            retailPrice: 5500,
            resellerPrice: 4800,
            wholesalePrice: 4200,
            stock: 200,
            weight: 25,
            dimensions: { height: 70, diameter: 35 },
            isActive: true
        },
        {
            size: '50kg',
            sku: 'FG-50KG-001',
            retailPrice: 10500,
            resellerPrice: 9200,
            wholesalePrice: 8000,
            stock: 100,
            weight: 50,
            dimensions: { height: 120, diameter: 40 },
            isActive: true
        }
    ],
    safetyInfo: 'Handle with care. Store in well-ventilated area away from heat sources. Check for leaks before use. Keep upright at all times. Do not expose to direct sunlight or temperatures above 50°C.',
    certifications: [
        'Kenya Bureau of Standards (KEBS)',
        'Energy and Petroleum Regulatory Authority (EPRA)',
        'ISO 9001:2015'
    ],
    features: [
        'High-quality steel construction',
        'Anti-rust coating',
        'Safety valve included',
        'Easy-grip handles',
        'Universal regulator compatibility',
        'Tamper-proof seal',
        '5-year warranty'
    ],
    specifications: {
        gasComposition: '95% Propane, 5% Butane',
        pressureRating: '17.5 bar max',
        valveType: 'POL (Prest-O-Lite)',
        material: 'Carbon Steel',
        warranty: '5 years'
    },
    rating: 4.5,
    reviews: [
        {
            userId: 'user-001',
            userName: 'Peter Ochieng',
            rating: 5,
            comment: 'Excellent quality cylinder! Fast delivery and great customer service.',
            verified: true,
            date: new Date('2025-12-15')
        },
        {
            userId: 'user-002',
            userName: 'Grace Muthoni',
            rating: 4,
            comment: 'Good product, lasts long. Would recommend for household use.',
            verified: true,
            date: new Date('2025-12-20')
        }
    ],
    totalSold: 1250,
    totalResellerSales: 850,
    totalClientSales: 400,
    isActive: true
};

async function seed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});

        // Create users
        console.log('👥 Creating test users...');
        const createdUsers = await User.insertMany(testUsers);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Create product
        console.log('📦 Creating FastGas product...');
        const createdProduct = await Product.create(fastGasProduct);
        console.log(`✅ Created product: ${createdProduct.name}`);

        // Print summary
        console.log('\n========================================');
        console.log('🎉 Database seeded successfully!');
        console.log('========================================\n');
        
        console.log('📋 TEST ACCOUNTS:');
        console.log('----------------------------------------');
        console.log('ADMIN:');
        console.log('  Email: admin@fastgas.co.ke');
        console.log('  Role: admin');
        console.log('');
        console.log('RESELLERS:');
        console.log('  Email: reseller@fastgas.co.ke');
        console.log('  Business: Kamau Gas Supplies');
        console.log('  Role: reseller (approved)');
        console.log('');
        console.log('  Email: reseller2@fastgas.co.ke');
        console.log('  Business: Wanjiku Energy Solutions');
        console.log('  Role: reseller (approved)');
        console.log('');
        console.log('CUSTOMERS:');
        console.log('  Email: customer@fastgas.co.ke');
        console.log('  Role: user');
        console.log('');
        console.log('  Email: customer2@fastgas.co.ke');
        console.log('  Role: user');
        console.log('');
        console.log('RIDER:');
        console.log('  Email: rider@fastgas.co.ke');
        console.log('  Role: rider');
        console.log('----------------------------------------');
        console.log('\n📦 FASTGAS PRODUCT:');
        console.log('  Variants: 6kg, 13kg, 25kg, 50kg');
        console.log('  Stock: 500, 350, 200, 100 units');
        console.log('----------------------------------------\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
