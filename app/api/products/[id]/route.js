import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    try {
        const { id } = await params
        const product = getProductById(id)

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}
