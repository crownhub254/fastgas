import { NextResponse } from 'next/server';
import clientPromise, { isMongoConfigured } from '@/lib/mongodb/mongodb';

// Fallback products if database is not available
const FALLBACK_PRODUCTS = [
    {
        _id: 'fastgas-670g',
        name: 'FastGas 670g N₂O Cylinder',
        slug: 'fastgas-670g-n2o-cylinder',
        description: 'Premium 670g N₂O cream charger cylinder. Food grade certified, perfect for professional culinary use. Creates the smoothest whipped cream and culinary foams.',
        brand: 'FastGas',
        category: 'n2o-cylinders',
        image: '/images/fastgas-670g.png',
        images: ['/images/fastgas-670g.png'],
        retailPrice: 7500,
        resellerPrice: 6375,
        wholesalePrice: 5625,
        stock: 150,
        specifications: {
            weight: '670g',
            gasType: 'N₂O (Nitrous Oxide)',
            purity: '99.9% Food Grade',
            dimensions: '32cm height, 8cm diameter'
        },
        features: ['Food Grade Certified', 'KEBS Approved', 'Professional Quality'],
        isActive: true,
        isFeatured: true
    },
    {
        _id: 'fastgas-regulator',
        name: 'Pressure Regulator',
        slug: 'fastgas-pressure-regulator',
        description: 'Professional pressure regulator designed for 670g N₂O cylinders. Precise pressure control for perfect results every time.',
        brand: 'FastGas',
        category: 'accessories',
        image: '/images/fastgas-regulator.png',
        images: ['/images/fastgas-regulator.png'],
        retailPrice: 2500,
        resellerPrice: 2125,
        wholesalePrice: 1875,
        stock: 80,
        specifications: {
            weight: '300g',
            material: 'Brass and Steel',
            compatibility: '670g Cylinders'
        },
        features: ['Precision Control', 'Durable Build', '1 Year Warranty'],
        isActive: true,
        isFeatured: true
    },
    {
        _id: 'fastgas-creamer',
        name: 'FastGas Cream Dispenser',
        slug: 'fastgas-cream-dispenser',
        description: 'Professional 500ml cream dispenser for creating perfect whipped cream, mousses, and espumas. Stainless steel construction.',
        brand: 'FastGas',
        category: 'accessories',
        image: '/images/fastgas-creamer.png',
        images: ['/images/fastgas-creamer.png'],
        retailPrice: 15000,
        resellerPrice: 12750,
        wholesalePrice: 11250,
        stock: 45,
        specifications: {
            capacity: '500ml',
            material: 'Stainless Steel',
            weight: '500g'
        },
        features: ['Professional Grade', 'Easy to Clean', 'Dishwasher Safe'],
        isActive: true,
        isFeatured: true
    }
];

// GET all products
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const priceTier = searchParams.get('priceTier') || 'retail';
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit')) || 50;
        
        let products = [];
        
        // Only try MongoDB if it's configured
        if (isMongoConfigured) {
            try {
                // Try to connect to MongoDB
                const client = await clientPromise;
                const db = client.db('fastgashub');
                
                // Build query
                const query = { isActive: true };
                if (category) query.category = category;
                if (featured === 'true') query.isFeatured = true;
                
                products = await db.collection('products')
                    .find(query)
                    .limit(limit)
                    .toArray();
                    
                console.log(`Found ${products.length} products from MongoDB`);
            } catch (dbError) {
                console.warn('MongoDB error, using fallback products:', dbError.message);
                products = FALLBACK_PRODUCTS;
            }
        } else {
            console.log('MongoDB not configured, using fallback products');
            products = FALLBACK_PRODUCTS;
        }
        
        // If no products in DB, use fallback
        if (!products || products.length === 0) {
            products = FALLBACK_PRODUCTS;
        }
        
        // Add display price based on tier
        const productsWithPrices = products.map(product => {
            const priceField = priceTier === 'wholesale' ? 'wholesalePrice' : 
                               priceTier === 'reseller' ? 'resellerPrice' : 'retailPrice';
            return {
                ...product,
                price: product[priceField] || product.retailPrice,
                displayPrice: product[priceField] || product.retailPrice
            };
        });

        return NextResponse.json({ 
            success: true, 
            products: productsWithPrices,
            count: productsWithPrices.length,
            priceTier
        }, { status: 200 });
    } catch (error) {
        console.error('Get products error:', error);
        
        // Return fallback products on any error
        const productsWithPrices = FALLBACK_PRODUCTS.map(p => ({
            ...p,
            price: p.retailPrice,
            displayPrice: p.retailPrice
        }));
        
        return NextResponse.json({ 
            success: true, 
            products: productsWithPrices,
            count: productsWithPrices.length,
            priceTier: 'retail',
            fallback: true
        }, { status: 200 });
    }
}

// POST - Create new product (admin only)
export async function POST(req) {
    try {
        const productData = await req.json();
        
        // Validate required fields
        if (!productData.name || !productData.retailPrice) {
            return NextResponse.json(
                { success: false, error: 'Name and retail price are required' },
                { status: 400 }
            );
        }
        
        const client = await clientPromise;
        const db = client.db('fastgashub');
        
        // Generate slug if not provided
        if (!productData.slug) {
            productData.slug = productData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        
        // Add timestamps
        productData.createdAt = new Date();
        productData.updatedAt = new Date();
        productData.isActive = productData.isActive !== false;
        
        const result = await db.collection('products').insertOne(productData);
        
        return NextResponse.json({ 
            success: true, 
            product: { ...productData, _id: result.insertedId },
            message: 'Product created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}
