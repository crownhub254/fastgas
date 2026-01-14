import { NextResponse } from 'next/server'
import { getAllProducts, addProduct } from '@/lib/products'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET all products
export async function GET() {
    try {
        const products = getAllProducts()
        return NextResponse.json(products, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

// POST new product (protected)
export async function POST(request) {
    try {
        // Check authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')

        if (!token || !verifyToken(token.value)) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        const productData = await request.json()

        // Validate required fields
        if (!productData.name || !productData.price || !productData.category) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Add product
        const newProduct = addProduct(productData)

        return NextResponse.json(
            {
                message: 'Product added successfully',
                product: newProduct
            },
            { status: 201 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to add product' },
            { status: 500 }
        )
    }
}
