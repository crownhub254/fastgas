'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Loader, Mail } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { clearCart } = useCart()

    const [isVerifying, setIsVerifying] = useState(true)
    const [paymentDetails, setPaymentDetails] = useState(null)
    const hasVerifiedRef = useRef(false) // Prevent double verification

    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('order_id')

    useEffect(() => {
        // CRITICAL: Prevent infinite loops and double verification
        if (hasVerifiedRef.current) {
            console.log('⚠️ Verification already attempted, skipping');
            return;
        }

        const verifyPayment = async () => {
            if (!sessionId || !orderId) {
                toast.error('Invalid payment session')
                router.push('/checkout')
                return
            }

            try {
                console.log('🔍 Verifying payment...', { sessionId, orderId });

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId, orderId })
                })

                const result = await response.json()

                if (result.success) {
                    setPaymentDetails(result)

                    // Only clear cart and show toast if NOT already processed
                    if (!result.alreadyProcessed) {
                        clearCart()
                        toast.success('Payment successful! 🎉')
                        console.log('✅ Payment verified and cart cleared');
                    } else {
                        console.log('ℹ️ Payment was already processed');
                        // Optionally clear cart anyway
                        clearCart()
                    }
                } else {
                    throw new Error(result.error || 'Payment verification failed')
                }
            } catch (error) {
                console.error('❌ Payment verification error:', error)
                toast.error('Failed to verify payment')
                router.push(`/payment-error?order_id=${orderId}`)
            } finally {
                setIsVerifying(false)
            }
        }

        // Mark as verified BEFORE the API call to prevent race conditions
        hasVerifiedRef.current = true
        verifyPayment()

    }, [sessionId, orderId, router, clearCart])

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-base-content mb-2">Verifying Payment</h2>
                    <p className="text-base-content/70">Please wait while we confirm your payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="card text-center"
                    >
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle className="w-16 h-16 text-success" />
                        </motion.div>

                        {/* Success Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl font-bold text-base-content mb-4">
                                Payment Successful!
                            </h1>
                            <p className="text-lg text-base-content/70 mb-8">
                                Thank you for your purchase. Your order has been confirmed.
                            </p>
                        </motion.div>

                        {/* Order Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-base-200 rounded-lg p-6 mb-8"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Order ID</span>
                                    <span className="font-bold text-base-content">{orderId}</span>
                                </div>
                                {paymentDetails?.payment && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-base-content/70">Transaction ID</span>
                                            <span className="font-mono text-sm text-base-content">
                                                {paymentDetails.payment.transactionId.slice(0, 20)}...
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-base-content/70">Amount Paid</span>
                                            <span className="font-bold text-success">
                                                ${paymentDetails.payment.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Payment Method</span>
                                    <span className="font-semibold text-base-content">Credit Card</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Email Confirmation Notice */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-info/10 border border-info/20 rounded-lg p-4 mb-8"
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Mail className="w-5 h-5 text-info" />
                                <span className="font-semibold text-base-content">Confirmation Email Sent</span>
                            </div>
                            <p className="text-sm text-base-content/70">
                                A confirmation email with your invoice has been sent to your registered email address.
                            </p>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href={`/orders/${orderId}`}
                                className="btn-primary inline-flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                View Order Details
                            </Link>
                            <Link
                                href="/products"
                                className="btn-secondary inline-flex items-center justify-center gap-2"
                            >
                                Continue Shopping
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
