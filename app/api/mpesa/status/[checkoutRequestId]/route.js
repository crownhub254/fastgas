// M-Pesa Status Check API Route
// GET /api/mpesa/status/[checkoutRequestId]

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { MpesaTransaction } from '@/lib/models';
import { querySTKPushStatus } from '@/lib/mpesa/config';

export async function GET(req, { params }) {
    try {
        const { checkoutRequestId } = await params;

        if (!checkoutRequestId) {
            return NextResponse.json(
                { success: false, error: 'Checkout Request ID is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Check database first
        const transaction = await MpesaTransaction.findOne({ checkoutRequestId });

        if (!transaction) {
            return NextResponse.json(
                { success: false, error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // If already completed or failed, return from database
        if (transaction.status !== 'pending') {
            return NextResponse.json({
                success: true,
                status: transaction.status,
                mpesaReceiptNumber: transaction.mpesaReceiptNumber,
                transactionDate: transaction.transactionDate,
                amount: transaction.amount,
                orderId: transaction.orderId,
            });
        }

        // If still pending, query M-Pesa directly
        const queryResult = await querySTKPushStatus(checkoutRequestId);

        if (queryResult.success) {
            // Update transaction based on query result
            if (queryResult.status === 'completed') {
                transaction.status = 'completed';
                await transaction.save();
            } else if (queryResult.status === 'cancelled' || queryResult.status === 'failed') {
                transaction.status = queryResult.status;
                transaction.resultDesc = queryResult.resultDesc;
                await transaction.save();
            }
            // If pending, no update needed

            return NextResponse.json({
                success: true,
                status: queryResult.status,
                message: queryResult.resultDesc,
                orderId: transaction.orderId,
            });
        }

        // Check if transaction has timed out (2 minutes)
        if (!transaction.isStillPending()) {
            transaction.status = 'timeout';
            await transaction.save();
            
            return NextResponse.json({
                success: true,
                status: 'timeout',
                message: 'Transaction timed out. Please try again.',
                orderId: transaction.orderId,
            });
        }

        // Still pending
        return NextResponse.json({
            success: true,
            status: 'pending',
            message: 'Waiting for payment confirmation. Please complete the M-Pesa prompt on your phone.',
            orderId: transaction.orderId,
        });

    } catch (error) {
        console.error('Status Check Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to check status' },
            { status: 500 }
        );
    }
}
