// app/api/users/route.js
// API route to manage users

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/mongodb'
import mongoose from 'mongoose'

// Get User model
const getUserModel = () => {
    if (mongoose.models.User) {
        return mongoose.models.User
    }
    
    const resellerProfileSchema = new mongoose.Schema({
        businessName: String,
        businessRegistrationNumber: String,
        businessLocation: {
            address: String,
            city: String,
            county: String,
            country: { type: String, default: 'Kenya' }
        },
        commissionRate: { type: Number, default: 10 },
        priceTier: { type: String, default: 'standard' },
        totalSales: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        totalCommissionEarned: { type: Number, default: 0 },
        outstandingBalance: { type: Number, default: 0 },
        currentStockLevel: { type: Number, default: 0 },
        activeClients: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: false },
        mpesaPhone: String
    })

    const userSchema = new mongoose.Schema({
        uid: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        displayName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        photoURL: { type: String, default: '' },
        role: { type: String, default: 'user' },
        provider: { type: String, required: true },
        resellerProfile: resellerProfileSchema,
        defaultAddress: {
            street: String,
            city: String,
            county: String,
            country: { type: String, default: 'Kenya' }
        },
        isActive: { type: Boolean, default: true },
        lastLogin: Date
    }, { timestamps: true })

    return mongoose.model('User', userSchema)
}

// GET /api/users - Get all users or filter by role
export async function GET(request) {
    try {
        await connectDB()
        const User = getUserModel()

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const limit = parseInt(searchParams.get('limit')) || 50

        let query = {}
        if (role) {
            query.role = role
        }

        const users = await User.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(limit)

        return NextResponse.json({
            success: true,
            users,
            count: users.length
        })

    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch users' 
        }, { status: 500 })
    }
}

// POST /api/users - Create a new user
export async function POST(request) {
    try {
        const userData = await request.json()

        await connectDB()
        const User = getUserModel()

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: userData.email },
                { uid: userData.uid }
            ]
        })

        if (existingUser) {
            return NextResponse.json({ 
                success: false, 
                error: 'User already exists' 
            }, { status: 400 })
        }

        const user = await User.create(userData)

        return NextResponse.json({
            success: true,
            user
        }, { status: 201 })

    } catch (error) {
        console.error('Create user error:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create user' 
        }, { status: 500 })
    }
}
