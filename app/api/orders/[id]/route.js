// Single Order API Route
// GET /api/orders/[id] - Get order details
// PUT /api/orders/[id] - Update order
// DELETE /api/orders/[id] - Cancel order

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { Order, Product } from '@/lib/models';

// GET - Get single order
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        await connectDB();

        // Find by MongoDB _id or orderId
        const order = await Order.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { orderId: id }
            ]
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error('Get Order Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update order status
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { orderStatus, paymentStatus, rider, note, updatedBy } = body;

        await connectDB();

        const order = await Order.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { orderId: id }
            ]
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Update order status
        if (orderStatus) {
            await order.updateStatus(orderStatus, note || '', updatedBy || '');
        }

        // Update payment status
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
            if (paymentStatus === 'completed') {
                order.paidAt = new Date();
            }
        }

        // Assign rider
        if (rider) {
            order.rider = {
                riderId: rider.riderId,
                riderName: rider.riderName,
                riderPhone: rider.riderPhone,
                assignedAt: new Date(),
            };
            order.statusHistory.push({
                status: 'rider_assigned',
                timestamp: new Date(),
                note: `Rider ${rider.riderName} assigned for delivery`,
                updatedBy: updatedBy || '',
            });
        }

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully',
            order,
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Cancel order
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const reason = searchParams.get('reason') || 'Cancelled by user';

        await connectDB();

        const order = await Order.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { orderId: id }
            ]
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return NextResponse.json(
                { success: false, error: 'Cannot cancel order in current status' },
                { status: 400 }
            );
        }

        // Restore stock
        for (const item of order.items) {
            await Product.updateStock(item.productId, item.quantity, 'increase');
        }

        // Update order status
        await order.updateStatus('cancelled', reason);

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
        });

    } catch (error) {
        console.error('Cancel Order Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
