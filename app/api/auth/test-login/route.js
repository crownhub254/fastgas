// app/api/auth/test-login/route.js
// Test login endpoint for development - NO DATABASE REQUIRED
// WARNING: Remove or disable this in production!

import { NextResponse } from 'next/server'

// Hardcoded test users - no database needed
const TEST_USERS = {
    'admin@fastgas.com': {
        uid: 'test-admin-001',
        email: 'admin@fastgas.com',
        displayName: 'Admin User',
        phoneNumber: '+254700000001',
        photoURL: '',
        role: 'admin',
        provider: 'email',
        defaultAddress: {
            street: 'FastGas HQ, Industrial Area',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'reseller@fastgas.com': {
        uid: 'test-reseller-001',
        email: 'reseller@fastgas.com',
        displayName: 'John Reseller',
        phoneNumber: '+254700000002',
        photoURL: '',
        role: 'reseller',
        provider: 'email',
        resellerProfile: {
            businessName: 'John Gas Supplies',
            businessRegistrationNumber: 'BN12345',
            businessLocation: {
                address: 'Mombasa Road Shop 45',
                city: 'Nairobi',
                county: 'Nairobi',
                country: 'Kenya'
            },
            commissionRate: 15,
            priceTier: 'premium',
            totalSales: 45,
            totalRevenue: 250000,
            totalCommissionEarned: 37500,
            outstandingBalance: 5000,
            currentStockLevel: 25,
            activeClients: 28,
            totalOrders: 45,
            averageOrderValue: 5500,
            isApproved: true,
            approvedBy: 'admin@fastgas.com',
            approvedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            mpesaPhone: '+254700000002'
        },
        defaultAddress: {
            street: 'Mombasa Road Shop 45',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'reseller2@fastgas.com': {
        uid: 'test-reseller-002',
        email: 'reseller2@fastgas.com',
        displayName: 'Jane Distributor',
        phoneNumber: '+254700000003',
        photoURL: '',
        role: 'reseller',
        provider: 'email',
        resellerProfile: {
            businessName: 'Jane LPG Distributors',
            businessRegistrationNumber: 'BN67890',
            businessLocation: {
                address: 'Westlands Plaza Unit 12',
                city: 'Nairobi',
                county: 'Nairobi',
                country: 'Kenya'
            },
            commissionRate: 20,
            priceTier: 'wholesale',
            totalSales: 82,
            totalRevenue: 500000,
            totalCommissionEarned: 100000,
            outstandingBalance: 0,
            currentStockLevel: 50,
            activeClients: 45,
            totalOrders: 82,
            averageOrderValue: 6100,
            isApproved: true,
            approvedBy: 'admin@fastgas.com',
            approvedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            mpesaPhone: '+254700000003'
        },
        defaultAddress: {
            street: 'Westlands Plaza Unit 12',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'customer@fastgas.com': {
        uid: 'test-customer-001',
        email: 'customer@fastgas.com',
        displayName: 'Alice Customer',
        phoneNumber: '+254700000004',
        photoURL: '',
        role: 'user',
        provider: 'email',
        defaultAddress: {
            street: 'Kilimani Apartments Block C',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true,
        createdAt: new Date().toISOString()
    },
    'rider@fastgas.com': {
        uid: 'test-rider-001',
        email: 'rider@fastgas.com',
        displayName: 'Mike Rider',
        phoneNumber: '+254700000006',
        photoURL: '',
        role: 'rider',
        provider: 'email',
        riderProfile: {
            vehicleType: 'motorcycle',
            vehicleNumber: 'KMCE 456X',
            deliveriesCompleted: 156,
            rating: 4.8,
            available: true
        },
        defaultAddress: {
            street: 'Eastleigh Section 3',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya'
        },
        isActive: true,
        createdAt: new Date().toISOString()
    }
}

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email is required' 
            }, { status: 400 })
        }

        // Find user in hardcoded list
        const user = TEST_USERS[email.toLowerCase()]

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: `User not found. Available test users: ${Object.keys(TEST_USERS).join(', ')}` 
            }, { status: 404 })
        }

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: user
        })

        // Set cookies for middleware
        response.cookies.set('auth-token', `test-token-${user.uid}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        response.cookies.set('user-role', user.role, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        })

        return response

    } catch (error) {
        console.error('Test login error:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Login failed: ' + error.message 
        }, { status: 500 })
    }
}

export async function GET() {
    const testAccounts = Object.entries(TEST_USERS).map(([email, user]) => ({
        email,
        displayName: user.displayName,
        role: user.role,
        businessName: user.resellerProfile?.businessName || null
    }))

    return NextResponse.json({
        message: 'Test login endpoint - NO DATABASE REQUIRED',
        usage: 'POST with { email: "admin@fastgas.com" }',
        testAccounts
    })
}
