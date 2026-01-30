'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, Package, ArrowLeft, Loader, User, Mail, Phone, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@/lib/firebase/auth'
import { getCounties, getConstituencies, getAreas, isValidKenyanPhone, formatKenyanPhone } from '@/utils/keLocations'
import toast from 'react-hot-toast'

// M-Pesa Logo component
const MpesaLogo = () => (
    <div className="flex items-center gap-1">
        <div className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">M</div>
        <span className="text-green-600 font-bold text-sm">PESA</span>
    </div>
)

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, getCartTotal, clearCart } = useCart()
    const [user, setUser] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // M-Pesa payment state
    const [mpesaStatus, setMpesaStatus] = useState('idle') // idle, pending, polling, success, failed
    const [checkoutRequestId, setCheckoutRequestId] = useState(null)
    const [pollCount, setPollCount] = useState(0)
    const maxPollAttempts = 30 // Poll for up to 60 seconds (30 x 2 seconds)

    // Buyer Information
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    })

    const [shippingInfo, setShippingInfo] = useState({
        street: '',
        county: '',
        constituency: '',
        area: '',
        landmark: '',
        country: 'Kenya'
    })

    const [counties] = useState(getCounties())
    const [constituencies, setConstituencies] = useState([])
    const [areas, setAreas] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('mpesa')

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            toast.error('Please login to continue')
            router.push('/login')
            return
        }
        setUser(currentUser)

        // Pre-fill buyer info from user data
        setBuyerInfo({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phoneNumber: ''
        })
    }, [router])

    useEffect(() => {
        if (shippingInfo.county) {
            setConstituencies(getConstituencies(shippingInfo.county))
            setShippingInfo(prev => ({ ...prev, constituency: '', area: '' }))
        }
    }, [shippingInfo.county])

    useEffect(() => {
        if (shippingInfo.county && shippingInfo.constituency) {
            setAreas(getAreas(shippingInfo.county, shippingInfo.constituency))
            setShippingInfo(prev => ({ ...prev, area: '' }))
        }
    }, [shippingInfo.county, shippingInfo.constituency])

    // Poll for M-Pesa payment status
    const pollPaymentStatus = useCallback(async (checkoutId, orderId) => {
        if (pollCount >= maxPollAttempts) {
            setMpesaStatus('failed')
            toast.error('Payment timeout. Please try again.')
            return
        }

        try {
            const response = await fetch(`/api/mpesa/status/${checkoutId}`)
            const result = await response.json()

            if (result.success) {
                if (result.status === 'completed') {
                    setMpesaStatus('success')
                    toast.success('Payment received successfully!')
                    clearCart()
                    setTimeout(() => {
                        router.push(`/order-success?orderId=${orderId}`)
                    }, 2000)
                    return
                } else if (result.status === 'failed') {
                    setMpesaStatus('failed')
                    toast.error(result.message || 'Payment failed. Please try again.')
                    return
                }
            }

            // Still pending, continue polling
            setPollCount(prev => prev + 1)
            setTimeout(() => pollPaymentStatus(checkoutId, orderId), 2000)
        } catch (error) {
            console.error('Error polling payment status:', error)
            setPollCount(prev => prev + 1)
            setTimeout(() => pollPaymentStatus(checkoutId, orderId), 2000)
        }
    }, [pollCount, clearCart, router])

    const handleBuyerInfoChange = (e) => {
        const { name, value } = e.target
        setBuyerInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleShippingChange = (e) => {
        const { name, value } = e.target
        setShippingInfo(prev => ({ ...prev, [name]: value }))
    }

    const subtotal = getCartTotal()
    const shipping = subtotal > 10000 ? 0 : 500 // Free shipping over KES 10,000
    const total = subtotal + shipping

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please login to continue')
            return
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty')
            return
        }

        // Validate buyer info
        if (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phoneNumber) {
            toast.error('Please fill in all contact information')
            return
        }

        // Validate Kenyan phone number
        if (!isValidKenyanPhone(buyerInfo.phoneNumber)) {
            toast.error('Please enter a valid Kenyan phone number (07XX XXX XXX)')
            return
        }

        // Validate shipping info
        if (!shippingInfo.street || !shippingInfo.county) {
            toast.error('Please fill in at least street address and county')
            return
        }

        setIsProcessing(true)
        setMpesaStatus('idle')

        try {
            // Create order first
            const orderData = {
                userId: user.uid,
                buyerInfo: {
                    ...buyerInfo,
                    phoneNumber: formatKenyanPhone(buyerInfo.phoneNumber)
                },
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery',
                subtotal,
                shipping,
                total,
                status: 'pending',
                paymentStatus: 'pending'
            }

            console.log('Creating order with data:', orderData)

            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text()
                console.error('Order creation failed:', errorText)
                throw new Error('Failed to create order')
            }

            const orderResult = await orderResponse.json()
            console.log('Order creation result:', orderResult)

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order')
            }

            const orderId = orderResult.order.orderId

            // If payment method is M-Pesa, initiate STK Push
            if (paymentMethod === 'mpesa') {
                setMpesaStatus('pending')
                toast('STK Push sent! Check your phone...', { icon: '📱' })

                console.log('Initiating M-Pesa STK Push for order:', orderId)

                const mpesaResponse = await fetch('/api/mpesa/stk-push', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        phoneNumber: buyerInfo.phoneNumber,
                        amount: total
                    })
                })

                const mpesaResult = await mpesaResponse.json()
                console.log('M-Pesa STK Push result:', mpesaResult)

                if (!mpesaResult.success) {
                    setMpesaStatus('failed')
                    throw new Error(mpesaResult.error || 'Failed to initiate M-Pesa payment')
                }

                // Start polling for payment status
                setCheckoutRequestId(mpesaResult.checkoutRequestId)
                setMpesaStatus('polling')
                setPollCount(0)
                pollPaymentStatus(mpesaResult.checkoutRequestId, orderId)

            } else {
                // Cash on Delivery
                clearCart()
                toast.success('Order placed successfully!')
                router.push(`/order-success?orderId=${orderId}`)
            }

        } catch (error) {
            console.error('Checkout error:', error)
            toast.error(error.message || 'Failed to process order. Please try again.')
            setIsProcessing(false)
            setMpesaStatus('idle')
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="section-padding">
                    <div className="container-custom max-w-md mx-auto text-center">
                        <Package className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-base-content mb-2">Your cart is empty</h2>
                        <p className="text-base-content/70 mb-6">Add some products to checkout</p>
                        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    <Link href="/cart" className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Link>

                    <h1 className="text-4xl font-bold text-base-content mb-8">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Buyer Contact Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card bg-base-200"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <User className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-base-content">Contact Information</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Full Name <span className="text-error">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={buyerInfo.name}
                                                onChange={handleBuyerInfoChange}
                                                required
                                                disabled={mpesaStatus === 'polling'}
                                                className="w-full pl-12 pr-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Email Address <span className="text-error">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={buyerInfo.email}
                                                onChange={handleBuyerInfoChange}
                                                required
                                                disabled={mpesaStatus === 'polling'}
                                                className="w-full pl-12 pr-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            M-Pesa Phone Number <span className="text-error">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={buyerInfo.phoneNumber}
                                                onChange={handleBuyerInfoChange}
                                                required
                                                disabled={mpesaStatus === 'polling'}
                                                className="w-full pl-12 pr-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                                placeholder="07XX XXX XXX"
                                            />
                                        </div>
                                        <p className="text-xs text-base-content/60 mt-1">
                                            This number will receive the M-Pesa payment prompt
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shipping Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card bg-base-200"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-base-content">Delivery Address</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Street Address / Building <span className="text-error">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingInfo.street}
                                            onChange={handleShippingChange}
                                            required
                                            disabled={mpesaStatus === 'polling'}
                                            className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                            placeholder="Building name, Street, House number"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                County <span className="text-error">*</span>
                                            </label>
                                            <select
                                                name="county"
                                                value={shippingInfo.county}
                                                onChange={handleShippingChange}
                                                required
                                                disabled={mpesaStatus === 'polling'}
                                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                            >
                                                <option value="">Select County</option>
                                                {counties.map(county => (
                                                    <option key={county} value={county}>{county.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Constituency
                                            </label>
                                            <select
                                                name="constituency"
                                                value={shippingInfo.constituency}
                                                onChange={handleShippingChange}
                                                disabled={!shippingInfo.county || mpesaStatus === 'polling'}
                                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-base-content"
                                            >
                                                <option value="">Select Constituency</option>
                                                {constituencies.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Area/Estate
                                            </label>
                                            <select
                                                name="area"
                                                value={shippingInfo.area}
                                                onChange={handleShippingChange}
                                                disabled={!shippingInfo.constituency || mpesaStatus === 'polling'}
                                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-base-content"
                                            >
                                                <option value="">Select Area</option>
                                                {areas.map(area => (
                                                    <option key={area} value={area}>{area}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Landmark (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={shippingInfo.landmark}
                                                onChange={handleShippingChange}
                                                disabled={mpesaStatus === 'polling'}
                                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content disabled:opacity-50"
                                                placeholder="Near supermarket, opposite church, etc."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Payment Method */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card bg-base-200"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-base-content">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 bg-base-100 rounded-lg cursor-pointer hover:bg-base-300/50 transition-colors border-2 border-transparent has-[:checked]:border-green-500">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="mpesa"
                                            checked={paymentMethod === 'mpesa'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            disabled={mpesaStatus === 'polling'}
                                            className="radio radio-success"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base-content flex items-center gap-2">
                                                M-Pesa
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                                            </div>
                                            <div className="text-sm text-base-content/60">Pay via M-Pesa STK Push</div>
                                        </div>
                                        <MpesaLogo />
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-base-100 rounded-lg cursor-pointer hover:bg-base-300/50 transition-colors border-2 border-transparent has-[:checked]:border-primary">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            disabled={mpesaStatus === 'polling'}
                                            className="radio radio-primary"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base-content">Cash on Delivery</div>
                                            <div className="text-sm text-base-content/60">Pay when you receive your order</div>
                                        </div>
                                    </label>
                                </div>

                                {/* M-Pesa Payment Status */}
                                {mpesaStatus !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <div className={`p-4 rounded-lg ${
                                            mpesaStatus === 'success' ? 'bg-green-100' :
                                            mpesaStatus === 'failed' ? 'bg-red-100' :
                                            'bg-yellow-100'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {mpesaStatus === 'pending' && (
                                                    <>
                                                        <Smartphone className="w-6 h-6 text-yellow-600 animate-pulse" />
                                                        <div>
                                                            <p className="font-semibold text-yellow-800">Check your phone</p>
                                                            <p className="text-sm text-yellow-700">An M-Pesa prompt has been sent to your phone</p>
                                                        </div>
                                                    </>
                                                )}
                                                {mpesaStatus === 'polling' && (
                                                    <>
                                                        <Clock className="w-6 h-6 text-yellow-600 animate-spin" />
                                                        <div>
                                                            <p className="font-semibold text-yellow-800">Waiting for payment...</p>
                                                            <p className="text-sm text-yellow-700">Enter your M-Pesa PIN on your phone to complete payment</p>
                                                        </div>
                                                    </>
                                                )}
                                                {mpesaStatus === 'success' && (
                                                    <>
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                        <div>
                                                            <p className="font-semibold text-green-800">Payment Successful!</p>
                                                            <p className="text-sm text-green-700">Redirecting to order confirmation...</p>
                                                        </div>
                                                    </>
                                                )}
                                                {mpesaStatus === 'failed' && (
                                                    <>
                                                        <XCircle className="w-6 h-6 text-red-600" />
                                                        <div>
                                                            <p className="font-semibold text-red-800">Payment Failed</p>
                                                            <p className="text-sm text-red-700">Please try again or choose a different payment method</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-base-200 sticky top-24">
                                <h2 className="text-2xl font-bold text-base-content mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-300">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm text-base-content line-clamp-1">{item.name}</h3>
                                                <p className="text-sm text-base-content/60">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="font-bold text-base-content">
                                                KES {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-base-300">
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Delivery</span>
                                        <span className="font-semibold text-success">
                                            {shipping === 0 ? 'FREE' : `KES ${shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-base-300">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-semibold text-base-content">Total</span>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                KES {total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing || mpesaStatus === 'polling' || mpesaStatus === 'success'}
                                    className={`w-full mt-6 py-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                        paymentMethod === 'mpesa' 
                                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                                            : 'bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90'
                                    }`}
                                >
                                    {isProcessing || mpesaStatus === 'polling' ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            {mpesaStatus === 'polling' ? 'Waiting for M-Pesa...' : 'Processing...'}
                                        </>
                                    ) : mpesaStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Payment Complete
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'mpesa' ? (
                                                <>
                                                    <Smartphone className="w-5 h-5" />
                                                    Pay with M-Pesa
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Place Order
                                                </>
                                            )}
                                        </>
                                    )}
                                </button>

                                {paymentMethod === 'mpesa' && mpesaStatus === 'idle' && (
                                    <p className="text-xs text-base-content/60 text-center mt-4">
                                        You will receive an M-Pesa prompt on your phone to complete payment
                                    </p>
                                )}

                                <p className="text-xs text-base-content/60 text-center mt-4">
                                    By placing your order, you agree to our terms and conditions
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
