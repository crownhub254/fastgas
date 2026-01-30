// M-Pesa Callback API Route
// POST /api/mpesa/callback
// Receives payment confirmation from Safaricom

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { MpesaTransaction, Order } from '@/lib/models';

export async function POST(req) {
    try {
        const body = await req.json();
        
        console.log('📱 M-Pesa Callback Received:', JSON.stringify(body, null, 2));

        // Extract callback data
        const stkCallback = body.Body?.stkCallback;
        
        if (!stkCallback) {
            console.error('Invalid callback format - no stkCallback');
            return NextResponse.json({ success: false, error: 'Invalid callback format' });
        }

        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

        // Connect to database
        await connectDB();

        // Find the transaction
        const transaction = await MpesaTransaction.findOne({ 
            checkoutRequestId: CheckoutRequestID 
        });

        if (!transaction) {
            console.error('Transaction not found:', CheckoutRequestID);
            return NextResponse.json({ 
                success: false, 
                error: 'Transaction not found' 
            });
        }

        // Process based on result code
        if (ResultCode === 0) {
            // Payment successful
            await transaction.markCompleted(body);
            
            // Update order
            await Order.findOneAndUpdate(
                { orderId: transaction.orderId },
                {
                    paymentStatus: 'completed',
                    orderStatus: 'confirmed',
                    paidAt: new Date(),
                    'mpesaTransaction.mpesaReceiptNumber': transaction.mpesaReceiptNumber,
                    'mpesaTransaction.transactionDate': transaction.transactionDate,
                    $push: {
                        statusHistory: {
                            status: 'confirmed',
                            timestamp: new Date(),
                            note: `Payment received via M-Pesa. Receipt: ${transaction.mpesaReceiptNumber}`,
                        }
                    }
                }
            );

            console.log('✅ Payment successful:', {
                orderId: transaction.orderId,
                receipt: transaction.mpesaReceiptNumber,
                amount: transaction.amount,
            });

        } else {
            // Payment failed or cancelled
            await transaction.markFailed(ResultCode, ResultDesc, body);
            
            // Update order
            const failureStatus = ResultCode === 1032 ? 'cancelled' : 'failed';
            await Order.findOneAndUpdate(
                { orderId: transaction.orderId },
                {
                    paymentStatus: 'failed',
                    $push: {
                        statusHistory: {
                            status: 'payment_failed',
                            timestamp: new Date(),
                            note: `M-Pesa payment ${failureStatus}: ${ResultDesc}`,
                        }
                    }
                }
            );

            console.log('❌ Payment failed:', {
                orderId: transaction.orderId,
                resultCode: ResultCode,
                resultDesc: ResultDesc,
            });
        }

        // Always return success to Safaricom
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Callback received successfully',
        });

    } catch (error) {
        console.error('M-Pesa Callback Error:', error);
        
        // Return success to prevent Safaricom retries
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Callback processed',
        });
    }
}

// Also handle GET for testing
export async function GET() {
    return NextResponse.json({
        message: 'M-Pesa callback endpoint is active',
        timestamp: new Date().toISOString(),
    });
}
