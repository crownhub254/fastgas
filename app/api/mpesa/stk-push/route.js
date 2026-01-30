// M-Pesa STK Push API Route
// POST /api/mpesa/stk-push

import { NextResponse } from 'next/server';
import { connectDB, isMongoConfigured } from '@/lib/mongodb/mongodb';
import { MpesaTransaction, Order } from '@/lib/models';
import { initiateSTKPush, formatPhoneNumber } from '@/lib/mpesa/config';

export async function POST(req) {
    try {
        const body = await req.json();
        const { phoneNumber, amount, orderId, userId } = body;

        // Validation
        if (!phoneNumber || !amount || !orderId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: phoneNumber, amount, orderId' },
                { status: 400 }
            );
        }

        // Validate phone number format
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone || formattedPhone.length !== 12) {
            return NextResponse.json(
                { success: false, error: 'Invalid phone number format. Use 0712345678 or 254712345678' },
                { status: 400 }
            );
        }

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum < 1) {
            return NextResponse.json(
                { success: false, error: 'Amount must be at least KES 1' },
                { status: 400 }
            );
        }

        // Check if database is configured
        if (!isMongoConfigured) {
            return NextResponse.json(
                { success: false, error: 'Database not configured' },
                { status: 503 }
            );
        }

        // Connect to database
        await connectDB();

        // Check for existing pending transaction
        const existingTransaction = await MpesaTransaction.findOne({
            orderId,
            status: 'pending',
        });

        if (existingTransaction && existingTransaction.isStillPending()) {
            return NextResponse.json({
                success: true,
                message: 'Payment already initiated. Please check your phone for M-Pesa prompt.',
                checkoutRequestId: existingTransaction.checkoutRequestId,
                isExisting: true,
            });
        }

        // Initiate STK Push
        const stkResult = await initiateSTKPush({
            phoneNumber: formattedPhone,
            amount: amountNum,
            orderId,
            accountReference: `FastGas-${orderId}`,
        });

        if (!stkResult.success) {
            return NextResponse.json(
                { success: false, error: stkResult.error },
                { status: 500 }
            );
        }

        // Save transaction to database
        const transaction = await MpesaTransaction.create({
            orderId,
            userId: userId || 'guest',
            phoneNumber: formattedPhone,
            amount: amountNum,
            merchantRequestId: stkResult.merchantRequestId,
            checkoutRequestId: stkResult.checkoutRequestId,
            accountReference: `FastGas-${orderId}`,
            status: 'pending',
        });

        // Update order with pending payment
        await Order.findOneAndUpdate(
            { orderId },
            {
                paymentStatus: 'processing',
                'mpesaTransaction.merchantRequestId': stkResult.merchantRequestId,
                'mpesaTransaction.checkoutRequestId': stkResult.checkoutRequestId,
                'mpesaTransaction.phoneNumber': formattedPhone,
                'mpesaTransaction.amount': amountNum,
            }
        );

        return NextResponse.json({
            success: true,
            message: 'STK Push sent successfully. Please check your phone and enter your M-Pesa PIN.',
            checkoutRequestId: stkResult.checkoutRequestId,
            transactionId: transaction._id,
        });

    } catch (error) {
        console.error('STK Push Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
