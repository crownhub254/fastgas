import { NextResponse } from 'next/server'
import {
    sendSMS,
    sendOrderConfirmationSMS,
    sendPaymentConfirmationSMS,
    sendOrderShippedSMS,
    sendDeliveryConfirmationSMS,
    sendRiderAssignmentSMS,
    sendResellerApprovalSMS,
} from '@/lib/sms/config'

/**
 * POST /api/sms/send
 * Send SMS notifications
 * 
 * Body:
 * - type: 'custom' | 'order-confirmation' | 'payment' | 'shipped' | 'delivered' | 'rider-assignment' | 'reseller-approval'
 * - phone: string (required)
 * - Additional fields based on type
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const { type, phone, ...data } = body

        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            )
        }

        let result

        switch (type) {
            case 'custom':
                if (!data.message) {
                    return NextResponse.json(
                        { success: false, error: 'Message is required for custom SMS' },
                        { status: 400 }
                    )
                }
                result = await sendSMS(phone, data.message)
                break

            case 'order-confirmation':
                if (!data.orderId || !data.total) {
                    return NextResponse.json(
                        { success: false, error: 'orderId and total are required' },
                        { status: 400 }
                    )
                }
                result = await sendOrderConfirmationSMS(phone, data.orderId, data.total)
                break

            case 'payment':
                if (!data.orderId || !data.amount || !data.mpesaCode) {
                    return NextResponse.json(
                        { success: false, error: 'orderId, amount, and mpesaCode are required' },
                        { status: 400 }
                    )
                }
                result = await sendPaymentConfirmationSMS(phone, data.orderId, data.amount, data.mpesaCode)
                break

            case 'shipped':
                if (!data.orderId || !data.riderName || !data.riderPhone) {
                    return NextResponse.json(
                        { success: false, error: 'orderId, riderName, and riderPhone are required' },
                        { status: 400 }
                    )
                }
                result = await sendOrderShippedSMS(phone, data.orderId, data.riderName, data.riderPhone)
                break

            case 'delivered':
                if (!data.orderId) {
                    return NextResponse.json(
                        { success: false, error: 'orderId is required' },
                        { status: 400 }
                    )
                }
                result = await sendDeliveryConfirmationSMS(phone, data.orderId)
                break

            case 'rider-assignment':
                if (!data.orderId || !data.address) {
                    return NextResponse.json(
                        { success: false, error: 'orderId and address are required' },
                        { status: 400 }
                    )
                }
                result = await sendRiderAssignmentSMS(phone, data.orderId, data.address)
                break

            case 'reseller-approval':
                if (!data.tier) {
                    return NextResponse.json(
                        { success: false, error: 'tier is required' },
                        { status: 400 }
                    )
                }
                result = await sendResellerApprovalSMS(phone, data.tier)
                break

            default:
                return NextResponse.json(
                    { success: false, error: `Unknown SMS type: ${type}` },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: result.success,
            mock: result.mock || false,
            message: result.success 
                ? 'SMS sent successfully' 
                : 'Failed to send SMS',
            error: result.error || null,
        })

    } catch (error) {
        console.error('❌ SMS API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
