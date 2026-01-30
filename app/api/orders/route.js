// Orders API Route
// GET /api/orders - List orders
// POST /api/orders - Create new order

import { NextResponse } from 'next/server';
import { connectDB, isMongoConfigured } from '@/lib/mongodb/mongodb';
import { Order, Product } from '@/lib/models';

// GET - List orders (with filters)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;

        if (!isMongoConfigured) {
            return NextResponse.json({
                success: true,
                orders: [],
                message: 'Database not configured',
                pagination: { total: 0, page: 1, pages: 0, limit }
            });
        }

        await connectDB();

        // Build query
        const query = {};
        if (userId) query.userId = userId;
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);

        return NextResponse.json({
            success: true,
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });

    } catch (error) {
        console.error('Get Orders Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new order
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            userId,
            userEmail,
            userName,
            items,
            shippingAddress,
            paymentMethod,
            shippingMethod,
            customerNote,
            resellerId,
            resellerName,
        } = body;

        // Validation
        if (!userId || !items || !items.length || !shippingAddress || !paymentMethod) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!isMongoConfigured) {
            return NextResponse.json(
                { success: false, error: 'Database not configured' },
                { status: 503 }
            );
        }

        await connectDB();

        // Generate order ID
        const orderId = await Order.generateOrderId();

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            // Validate product and get current price
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Product not found: ${item.productId}` },
                    { status: 400 }
                );
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { success: false, error: `Insufficient stock for ${product.name}` },
                    { status: 400 }
                );
            }

            const unitPrice = item.unitPrice || product.retailPrice;
            const itemTotal = unitPrice * item.quantity;

            orderItems.push({
                productId: product._id,
                name: product.name,
                sku: product.sku,
                image: product.image,
                quantity: item.quantity,
                unitPrice,
                total: itemTotal,
            });

            subtotal += itemTotal;

            // Reserve stock
            await Product.updateStock(product._id, item.quantity, 'decrease');
        }

        // Calculate shipping
        const shippingFee = shippingMethod === 'express' ? 500 : shippingMethod === 'pickup' ? 0 : 200;

        // Determine order type
        const orderType = resellerId ? 'reseller' : 'retail';

        // Create order
        const order = await Order.create({
            orderId,
            userId,
            userEmail,
            userName,
            resellerId,
            resellerName,
            orderType,
            items: orderItems,
            subtotal,
            discount: 0,
            shippingFee,
            tax: 0,
            total: subtotal + shippingFee,
            shippingAddress,
            shippingMethod: shippingMethod || 'standard',
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            customerNote,
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order created',
            }],
        });

        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            order: {
                orderId: order.orderId,
                _id: order._id,
                total: order.total,
                paymentMethod: order.paymentMethod,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
