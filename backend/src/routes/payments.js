const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { generateInvoice } = require('../utils/invoice');
const { sendOrderConfirmationEmail } = require('../utils/email');
const User = require('../models/User');
const NotificationService = require('../utils/notificationService');

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { orderId, items, shipping, tax, customerEmail } = req.body;

        // Validate required fields
        if (!orderId || !items || !customerEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if order exists
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if payment already exists and is completed
        const existingPayment = await Payment.findOne({
            orderId,
            status: 'succeeded'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                error: 'Payment already completed for this order'
            });
        }

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Add shipping as a line item if applicable
        if (shipping > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping',
                    },
                    unit_amount: Math.round(shipping * 100),
                },
                quantity: 1,
            });
        }

        // Add tax as a line item
        if (tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Tax',
                    },
                    unit_amount: Math.round(tax * 100),
                },
                quantity: 1,
            });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            customer_email: customerEmail,
            client_reference_id: orderId,
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?order_id=${orderId}`,
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe Checkout Session Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create checkout session'
        });
    }
});

// Verify Payment Success (called from success page)
router.post('/verify-session', async (req, res) => {
    try {
        const { sessionId, orderId } = req.body;

        // Validate required fields
        if (!sessionId || !orderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing sessionId or orderId'
            });
        }

        console.log('🔍 Verifying payment for session:', sessionId, 'order:', orderId);

        // --- STEP 1: Retrieve Stripe session ---
        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
            console.log('✅ Stripe session retrieved:', session.id, 'Payment status:', session.payment_status);
        } catch (err) {
            console.error('❌ Stripe session retrieve error:', err);
            return res.status(400).json({
                success: false,
                error: 'Invalid Stripe session ID'
            });
        }

        // Check if payment was completed
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Payment not completed'
            });
        }

        // --- STEP 2: Find the order ---
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // --- STEP 3: Check if payment already exists (IDEMPOTENCY) ---
        let payment = await Payment.findOne({ orderId });

        if (payment) {
            console.log('⚠️ Payment already processed for order:', orderId);

            // Update order if needed
            if (order.paymentStatus !== 'completed') {
                order.paymentStatus = 'completed';
                order.status = 'confirmed';
                await order.save();
            }

            return res.status(200).json({
                success: true,
                payment,
                order,
                alreadyProcessed: true,
                message: 'Payment already verified'
            });
        }

        // --- STEP 4: Create new payment record ---
        payment = new Payment({
            orderId,
            transactionId: session.payment_intent,
            amount: session.amount_total / 100,
            status: 'succeeded',
            paymentMethod: 'Credit Card',
            currency: session.currency || 'usd'
        });
        await payment.save();

        // --- STEP 5: Update order status ---
        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        await order.save();

        console.log('✅ Payment verified successfully for order:', orderId);

        // --- STEP 6: Send Notifications (after payment is created) ---
        try {
            await NotificationService.notifyPaymentSuccess(
                order.userId,
                order.orderId,
                payment.amount
            );

            await NotificationService.notifyOrderConfirmed(
                order.userId,
                order.orderId
            );
            console.log('✅ Notifications sent successfully');
        } catch (notifyError) {
            console.error('⚠️ Notification sending failed:', notifyError);
            // Continue - don't block response if notifications fail
        }

        // --- STEP 7: Generate Invoice ---
        let invoicePDF;
        try {
            invoicePDF = await generateInvoice({ order, payment });
            console.log('✅ Invoice generated successfully');
        } catch (error) {
            console.error('❌ Invoice generation failed:', error);
            // Continue even if invoice fails - don't block the response
        }

        let userEmail;
        try {
            const user = await User.findOne({ uid: order.userId });
            if (user && user.email) {
                userEmail = user.email;
            } else {
                console.warn(`⚠️ User not found or no email for uid: ${order.userId}`);
            }
        } catch (err) {
            console.error('❌ Error fetching user for email:', err);
        }

        // --- STEP 8: Send Email (async, don't block response) ---
        if (invoicePDF && userEmail) {
            sendOrderConfirmationEmail({
                customerEmail: userEmail,
                order,
                payment,
                invoicePDF
            }).then(() => {
                console.log('✅ Email sent successfully to:', userEmail);
            }).catch(error => {
                console.error('❌ Email sending failed:', error);
            });
        }

        // --- STEP 9: Return success response ---
        res.status(200).json({
            success: true,
            payment,
            order,
            alreadyProcessed: false,
            message: 'Payment verified and processed successfully'
        });

    } catch (error) {
        console.error('❌ Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify payment'
        });
    }
});

// Handle payment cancellation
router.post('/cancel-payment', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing orderId'
            });
        }

        // Find and update order status
        const order = await Order.findOne({ orderId });
        if (order) {
            // Only update if not already completed
            if (order.paymentStatus !== 'completed') {
                order.paymentStatus = 'cancelled';
                order.status = 'cancelled';
                await order.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment cancelled',
            order
        });
    } catch (error) {
        console.error('Payment Cancellation Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to cancel payment'
        });
    }
});

// Stripe Webhook (for production use)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.client_reference_id;

                if (!orderId) {
                    console.error('No orderId in webhook session');
                    break;
                }

                // Check if payment already exists (prevent duplicates)
                let payment = await Payment.findOne({ orderId });

                if (!payment) {
                    // Create payment record
                    payment = new Payment({
                        orderId,
                        transactionId: session.payment_intent,
                        amount: session.amount_total / 100,
                        status: 'succeeded',
                        paymentMethod: 'Credit Card',
                        currency: session.currency || 'usd'
                    });
                    await payment.save();
                }

                // Update order
                const order = await Order.findOne({ orderId });
                if (order && order.paymentStatus !== 'completed') {
                    order.paymentStatus = 'completed';
                    order.status = 'confirmed';
                    await order.save();

                    // Send notifications
                    try {
                        await NotificationService.notifyPaymentSuccess(
                            order.userId,
                            order.orderId,
                            payment.amount
                        );

                        await NotificationService.notifyOrderConfirmed(
                            order.userId,
                            order.orderId
                        );
                    } catch (notifyError) {
                        console.error('⚠️ Webhook notification failed:', notifyError);
                    }
                }
                break;

            case 'payment_intent.payment_failed':
                // Handle payment failure
                const failedIntent = event.data.object;
                console.log('Payment failed:', failedIntent.id);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get payment'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${payments.length} payments`);

        res.status(200).json({
            success: true,
            count: payments.length,
            payments: payments
        });
    } catch (error) {
        console.error('❌ Get payments error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            payments: []
        });
    }
});

module.exports = router;
