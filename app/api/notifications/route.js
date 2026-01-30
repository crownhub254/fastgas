import { NextResponse } from 'next/server'

// Demo notifications data
const DEMO_NOTIFICATIONS = [
    {
        _id: 'notif-001',
        userId: 'demo-user',
        title: 'Order Confirmed',
        message: 'Your order #ORD-001 has been confirmed and is being processed.',
        type: 'order',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
    },
    {
        _id: 'notif-002',
        userId: 'demo-user',
        title: 'New Stock Available',
        message: '50kg FastGas cylinders are now back in stock!',
        type: 'stock',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        _id: 'notif-003',
        userId: 'demo-user',
        title: 'Delivery Update',
        message: 'Your order is out for delivery. Expected arrival: 2-4 hours.',
        type: 'delivery',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    },
    {
        _id: 'notif-004',
        userId: 'demo-user',
        title: 'Special Offer!',
        message: 'Get 10% off on all 25kg cylinders this week only.',
        type: 'promo',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    }
]

// GET - Fetch user notifications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        // Return demo data if no userId or in demo mode
        if (!userId || userId === 'demo-user' || !process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                success: true,
                notifications: DEMO_NOTIFICATIONS,
                unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length
            })
        }

        // Forward request to backend API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${userId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                {
                    success: false,
                    error: errorData.error || 'Failed to fetch notifications'
                },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch notifications'
            },
            { status: 500 }
        )
    }
}
