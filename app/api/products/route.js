import { NextResponse } from 'next/server';

// FastGas Product - Single product with variants (no database required for demo)
const FASTGAS_PRODUCT = {
    _id: 'fastgas-cylinder-001',
    name: 'FastGas LPG Cylinder',
    slug: 'fastgas-lpg-cylinder',
    description: 'Premium quality LPG cylinders for home and commercial use. Safe, reliable, and efficient cooking gas. All cylinders come with safety valves and are regularly inspected for quality.',
    brand: 'FastGas',
    productType: 'gas-cylinder',
    gasType: 'LPG',
    image: '/images/fastgas-cylinder.png',
    images: ['/images/fastgas-cylinder.png', '/images/fastgas-6kg.png', '/images/fastgas-13kg.png'],
    variants: [
        {
            size: '6kg',
            sku: 'FG-6KG',
            retailPrice: 1500,
            resellerPrice: 1350,
            wholesalePrice: 1200,
            stock: 100,
            weight: 6,
            dimensions: { height: 30, diameter: 25 },
            isActive: true
        },
        {
            size: '13kg',
            sku: 'FG-13KG',
            retailPrice: 2800,
            resellerPrice: 2520,
            wholesalePrice: 2240,
            stock: 75,
            weight: 13,
            dimensions: { height: 50, diameter: 30 },
            isActive: true
        },
        {
            size: '25kg',
            sku: 'FG-25KG',
            retailPrice: 5200,
            resellerPrice: 4680,
            wholesalePrice: 4160,
            stock: 40,
            weight: 25,
            dimensions: { height: 70, diameter: 35 },
            isActive: true
        },
        {
            size: '50kg',
            sku: 'FG-50KG',
            retailPrice: 9500,
            resellerPrice: 8550,
            wholesalePrice: 7600,
            stock: 20,
            weight: 50,
            dimensions: { height: 100, diameter: 45 },
            isActive: true
        }
    ],
    safetyInfo: 'Handle with care. Store in well-ventilated area. Keep away from heat sources and open flames. Check for leaks regularly.',
    certifications: ['KEBS Certified', 'ISO 9001', 'LPG Safety Standard'],
    features: [
        'Premium quality LPG',
        'Safety valve included',
        'Regular quality inspections',
        'Fast delivery across Kenya',
        'Easy refill service'
    ],
    specifications: {
        gasComposition: 'Propane/Butane Mix',
        pressureRating: '17 bar',
        valveType: 'Standard POL',
        material: 'Steel',
        warranty: '10 years on cylinder'
    },
    rating: 4.8,
    reviews: [
        {
            userId: 'user-001',
            userName: 'John M.',
            rating: 5,
            comment: 'Excellent quality gas, lasts long!',
            verified: true,
            date: new Date().toISOString()
        },
        {
            userId: 'user-002',
            userName: 'Mary W.',
            rating: 5,
            comment: 'Fast delivery and great service',
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

// GET all products (returns single FastGas product)
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
            message: 'FastGas cylinder product'
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
