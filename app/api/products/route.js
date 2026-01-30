import { NextResponse } from 'next/server';

// FastGas Products - N₂O Cream Chargers for Culinary Use
const FASTGAS_PRODUCT = {
    _id: 'fastgas-n2o-001',
    name: 'FastGas N₂O Products',
    slug: 'fastgas-n2o-products',
    description: 'Premium quality N₂O (Nitrous Oxide) cream chargers for professional culinary use. Perfect for creating whipped cream, mousses, espumas, and other culinary foams. Food-grade certified and trusted by professional chefs across Kenya.',
    brand: 'FastGas',
    productType: 'cream-charger',
    gasType: 'N2O',
    image: '/images/fastgas-670g.png',
    images: ['/images/fastgas-670g.png', '/images/fastgas-regulator.png', '/images/fastgas-creamer.png'],
    variants: [
        {
            size: '670g N₂O Cylinder',
            sku: 'FG-670G',
            retailPrice: 7500,
            resellerPrice: 6375,
            wholesalePrice: 5625,
            stock: 150,
            weight: 0.67,
            dimensions: { height: 32, diameter: 8 },
            isActive: true,
            description: 'Premium 670g N₂O cream charger cylinder - Food grade certified'
        },
        {
            size: 'Pressure Regulator',
            sku: 'FG-REG',
            retailPrice: 2500,
            resellerPrice: 2125,
            wholesalePrice: 1875,
            stock: 80,
            weight: 0.3,
            dimensions: { height: 10, diameter: 5 },
            isActive: true,
            description: 'Professional pressure regulator for 670g cylinders'
        },
        {
            size: 'FastGas Creamer',
            sku: 'FG-CREAMER',
            retailPrice: 15000,
            resellerPrice: 12750,
            wholesalePrice: 11250,
            stock: 45,
            weight: 0.5,
            dimensions: { height: 35, diameter: 10 },
            isActive: true,
            description: 'Professional cream dispenser - 500ml capacity'
        }
    ],
    safetyInfo: 'For culinary use only. Do not inhale. Store in cool, dry place away from heat sources. Use with compatible dispensers only. Keep out of reach of children.',
    certifications: ['Food Grade Certified', 'KEBS Approved', 'ISO 9001'],
    features: [
        'Premium food-grade N₂O',
        'Perfect for whipped cream & culinary foams',
        'Compatible with standard dispensers',
        'Fast delivery across Kenya',
        'Professional chef approved'
    ],
    specifications: {
        gasComposition: 'Pure N₂O (Nitrous Oxide)',
        purity: '99.9% Food Grade',
        pressureRating: '40 bar',
        valveType: 'Standard 8g compatible',
        material: 'Steel cylinder with brass valve',
        warranty: '1 year on accessories'
    },
    rating: 4.8,
    reviews: [
        {
            userId: 'user-001',
            userName: 'John M.',
            rating: 5,
            comment: 'Perfect for our dessert preparations! Cream comes out silky smooth.',
            verified: true,
            date: new Date().toISOString()
        },
        {
            userId: 'user-002',
            userName: 'Mary W.',
            rating: 5,
            comment: 'Fast delivery and excellent quality N₂O. Our pastry chefs love it!',
            verified: true,
            date: new Date().toISOString()
        }
    ],
    totalSold: 1250,
    totalResellerSales: 850,
    totalClientSales: 400,
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// GET all products (returns FastGas N₂O products)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const includeVariants = searchParams.get('variants') !== 'false';
        const priceTier = searchParams.get('priceTier') || 'retail';
        
        // Format product for response
        const product = { ...FASTGAS_PRODUCT };
        
        // Add display price based on tier
        if (product.variants && product.variants.length > 0) {
            const priceField = priceTier === 'wholesale' ? 'wholesalePrice' : 
                               priceTier === 'reseller' ? 'resellerPrice' : 'retailPrice';
            product.price = product.variants[0][priceField]; // Default to first variant price
            product.minPrice = Math.min(...product.variants.map(v => v[priceField]));
            product.maxPrice = Math.max(...product.variants.map(v => v[priceField]));
        }

        return NextResponse.json({ 
            success: true, 
            products: [product],
            product: product, // Also return as single product
            message: 'FastGas N₂O cream charger products'
        }, { status: 200 });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to get products' },
            { status: 500 }
        );
    }
}

// POST - Not needed for single product, but kept for admin updates
export async function POST(req) {
    try {
        return NextResponse.json(
            { 
                success: false, 
                message: 'FastGas is a single-product shop. Use PUT to update product details.' 
            },
            { status: 400 }
        );
    } catch (error) {
        console.error('Add product error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to add product', error: error.message },
            { status: 500 }
        );
    }
}
