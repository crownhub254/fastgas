// app/api/resellers/route.js
// API route to manage resellers

import { NextResponse } from 'next/server'
import { connectDB, isMongoConfigured } from '@/lib/mongodb/mongodb'
import mongoose from 'mongoose'

// Demo data for when MongoDB is not configured
const DEMO_RESELLERS = [
    {
        id: 'demo-1',
        uid: 'demo-reseller-1',
        email: 'reseller1@fastgas.co.ke',
        displayName: 'Jane Wanjiku',
        phoneNumber: '+254712345678',
        role: 'reseller',
        isApproved: true,
        businessName: 'Wanjiku Gas Suppliers',
        location: 'Nairobi, Westlands',
        totalSales: 156,
        totalRevenue: 234000,
        commissionEarned: 23400,
        activeClients: 45,
        currentStock: 25,
        status: 'active'
    },
    {
        id: 'demo-2',
        uid: 'demo-reseller-2', 
        email: 'reseller2@fastgas.co.ke',
        displayName: 'John Kamau',
        phoneNumber: '+254723456789',
        role: 'reseller',
        isApproved: true,
        businessName: 'Kamau Gas Distributors',
        location: 'Mombasa, Nyali',
        totalSales: 89,
        totalRevenue: 178000,
        commissionEarned: 17800,
        activeClients: 32,
        currentStock: 18,
        status: 'active'
    }
]

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
        approvedBy: String,
        approvedAt: Date,
        mpesaPhone: String,
        adminNotes: String
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

// GET /api/resellers - Get all resellers with stats
export async function GET(request) {
    try {
        // Return demo data if MongoDB is not configured
        if (!isMongoConfigured) {
            return NextResponse.json({
                success: true,
                demo: true,
                resellers: DEMO_RESELLERS,
                stats: {
                    totalResellers: 2,
                    approvedResellers: 2,
                    totalRevenue: 412000,
                    totalSales: 245,
                    totalCommission: 41200,
                    totalClients: 77
                }
            })
        }

        await connectDB()
        const User = getUserModel()

        const { searchParams } = new URL(request.url)
        const approved = searchParams.get('approved')
        const sort = searchParams.get('sort') || 'totalRevenue'
        const limit = parseInt(searchParams.get('limit')) || 50

        let query = { role: 'reseller' }
        
        if (approved === 'true') {
            query['resellerProfile.isApproved'] = true
        } else if (approved === 'false') {
            query['resellerProfile.isApproved'] = false
        }

        let sortOption = {}
        switch (sort) {
            case 'totalRevenue':
                sortOption = { 'resellerProfile.totalRevenue': -1 }
                break
            case 'totalSales':
                sortOption = { 'resellerProfile.totalSales': -1 }
                break
            case 'activeClients':
                sortOption = { 'resellerProfile.activeClients': -1 }
                break
            default:
                sortOption = { createdAt: -1 }
        }

        const resellers = await User.find(query)
            .select('-__v')
            .sort(sortOption)
            .limit(limit)

        // Calculate aggregate stats
        const stats = await User.aggregate([
            { $match: { role: 'reseller' } },
            {
                $group: {
                    _id: null,
                    totalResellers: { $sum: 1 },
                    approvedResellers: {
                        $sum: { $cond: ['$resellerProfile.isApproved', 1, 0] }
                    },
                    totalRevenue: { $sum: '$resellerProfile.totalRevenue' },
                    totalSales: { $sum: '$resellerProfile.totalSales' },
                    totalCommission: { $sum: '$resellerProfile.totalCommissionEarned' },
                    totalClients: { $sum: '$resellerProfile.activeClients' }
                }
            }
        ])

        // Format resellers for response
        const formattedResellers = resellers.map(r => ({
            _id: r._id,
            uid: r.uid,
            name: r.displayName,
            email: r.email,
            phone: r.phoneNumber,
            businessName: r.resellerProfile?.businessName,
            location: r.resellerProfile?.businessLocation?.city,
            county: r.resellerProfile?.businessLocation?.county,
            totalSales: r.resellerProfile?.totalSales || 0,
            totalRevenue: r.resellerProfile?.totalRevenue || 0,
            totalCommission: r.resellerProfile?.totalCommissionEarned || 0,
            activeClients: r.resellerProfile?.activeClients || 0,
            totalOrders: r.resellerProfile?.totalOrders || 0,
            stockLevel: r.resellerProfile?.currentStockLevel || 0,
            priceTier: r.resellerProfile?.priceTier || 'standard',
            commissionRate: r.resellerProfile?.commissionRate || 10,
            isApproved: r.resellerProfile?.isApproved || false,
            createdAt: r.createdAt,
            lastLogin: r.lastLogin
        }))

        return NextResponse.json({
            success: true,
            resellers: formattedResellers,
            stats: stats[0] || {
                totalResellers: 0,
                approvedResellers: 0,
                totalRevenue: 0,
                totalSales: 0,
                totalCommission: 0,
                totalClients: 0
            },
            count: formattedResellers.length
        })

    } catch (error) {
        console.error('Get resellers error:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch resellers' 
        }, { status: 500 })
    }
}

// POST /api/resellers - Create/register a new reseller
export async function POST(request) {
    try {
        const data = await request.json()

        await connectDB()
        const User = getUserModel()

        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email })

        if (existingUser) {
            // Update existing user to reseller
            existingUser.role = 'reseller'
            existingUser.resellerProfile = {
                businessName: data.businessName,
                businessRegistrationNumber: data.businessRegistrationNumber,
                businessLocation: data.businessLocation,
                commissionRate: 10,
                priceTier: 'standard',
                isApproved: false,
                mpesaPhone: data.mpesaPhone || data.phoneNumber
            }
            await existingUser.save()

            return NextResponse.json({
                success: true,
                message: 'User upgraded to reseller (pending approval)',
                user: existingUser
            })
        }

        // Create new reseller
        const newReseller = await User.create({
            uid: `reseller-${Date.now()}`,
            email: data.email,
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
            role: 'reseller',
            provider: 'email',
            resellerProfile: {
                businessName: data.businessName,
                businessRegistrationNumber: data.businessRegistrationNumber,
                businessLocation: data.businessLocation,
                commissionRate: 10,
                priceTier: 'standard',
                isApproved: false,
                mpesaPhone: data.mpesaPhone || data.phoneNumber
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Reseller registered (pending approval)',
            user: newReseller
        }, { status: 201 })

    } catch (error) {
        console.error('Create reseller error:', error)
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create reseller' 
        }, { status: 500 })
    }
}
