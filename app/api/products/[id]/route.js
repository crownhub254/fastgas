import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/mongodb'
import Product from '@/lib/models/Product'

// FastGas product data as fallback
const FASTGAS_PRODUCTS = [
    {
        id: 'fastgas-670g',
        slug: 'fastgas-670g',
        name: 'FastGas Original 670g',
        price: 7500,
        image: 'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_side-view.png',
        description: 'Premium 670g N₂O cylinder for professional culinary use.',
        category: 'cylinders',
        inStock: true
    },
    {
        id: 'pressure-regulator',
        slug: 'pressure-regulator',
        name: 'Pressure Regulator',
        price: 2500,
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/Pressure-Regulator-transparent.png',
        description: 'Essential pressure regulator for FastGas cylinders.',
        category: 'accessories',
        inStock: true
    },
    {
        id: 'fastgas-creamer',
        slug: 'fastgas-creamer',
        name: 'FastGas Creamer',
        price: 15000,
        image: 'https://fast-gas.com/wp-content/uploads/2024/06/fg-new-branding-670-original.png',
        description: 'Professional FastGas cream dispenser system.',
        category: 'equipment',
        inStock: true
    },
    {
        id: 'cream-syphon',
        slug: 'cream-syphon',
        name: 'FastGas Cream Syphon',
        price: 8500,
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/3.png',
        description: 'Premium cream syphon for culinary creations.',
        category: 'equipment',
        inStock: true
    }
]

export async function GET(request, { params }) {
    try {
        const { id } = await params
        
        // First check fallback products
        let product = FASTGAS_PRODUCTS.find(p => p.id === id || p.slug === id)
        
        // If not found in fallback, try database
        if (!product) {
            try {
                await connectDB()
                product = await Product.findOne({ 
                    $or: [{ _id: id }, { slug: id }] 
                }).lean()
                
                if (product) {
                    product = {
                        ...product,
                        id: product._id?.toString() || product.id
                    }
                }
            } catch (dbError) {
                console.log('Database lookup failed, using fallback only')
            }
        }

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product, { status: 200 })
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { message: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}
