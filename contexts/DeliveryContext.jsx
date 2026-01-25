'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import {
    calculateDeliveryCharge,
    calculateRiderCommission,
    isWithinCity,
    DELIVERY_STATUS
} from '@/lib/delivery/deliveryPricing'

const DeliveryContext = createContext(undefined)

export function DeliveryProvider({ children }) {
    const [deliveries, setDeliveries] = useState([])
    const [selectedDelivery, setSelectedDelivery] = useState(null)

    // Create new delivery order
    const createDelivery = useCallback((deliveryData) => {
        const {
            orderId,
            userId,
            productType,
            weight,
            pickupLocation,
            deliveryLocation,
            description = '',
            dimensions = {}
        } = deliveryData

        const deliveryWithinCity = isWithinCity({
            pickupDistrict: pickupLocation.district,
            deliveryDistrict: deliveryLocation.district
        })

        const deliveryCharge = calculateDeliveryCharge({
            productType,
            weight,
            isWithinCity: deliveryWithinCity
        })

        const riderCommission = calculateRiderCommission(
            deliveryCharge,
            deliveryWithinCity
        )

        const newDelivery = {
            deliveryId: `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            orderId,
            userId,
            productType,
            weight,
            dimensions,
            description,
            pickupLocation,
            deliveryLocation,
            isWithinCity: deliveryWithinCity,
            deliveryCharge,
            riderCommission,
            status: DELIVERY_STATUS.UNPAID,
            pickupRiderId: null,
            deliveryRiderId: null,
            pickupTimestamp: null,
            deliveryTimestamp: null,
            otp: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setDeliveries(prev => [...prev, newDelivery])
        return newDelivery
    }, [])

    // Update delivery status
    const updateDeliveryStatus = useCallback((deliveryId, newStatus) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId
                    ? {
                        ...delivery,
                        status: newStatus,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Assign pickup rider
    const assignPickupRider = useCallback((deliveryId, riderId) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId
                    ? {
                        ...delivery,
                        pickupRiderId: riderId,
                        status: DELIVERY_STATUS.READY_TO_PICKUP,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Assign delivery rider
    const assignDeliveryRider = useCallback((deliveryId, riderId) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId
                    ? {
                        ...delivery,
                        deliveryRiderId: riderId,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Update pickup timestamp (when rider picks up)
    const pickupProduct = useCallback((deliveryId, riderId) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId &&
                    delivery.pickupRiderId === riderId
                    ? {
                        ...delivery,
                        pickupTimestamp: new Date().toISOString(),
                        status: delivery.isWithinCity
                            ? DELIVERY_STATUS.READY_FOR_DELIVERY
                            : DELIVERY_STATUS.IN_TRANSIT,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Reach warehouse (for cross-city deliveries)
    const reachWarehouse = useCallback((deliveryId, riderId) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId &&
                    delivery.pickupRiderId === riderId
                    ? {
                        ...delivery,
                        status: DELIVERY_STATUS.REACHED_WAREHOUSE,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Ship to destination (after reaching warehouse)
    const shipToDestination = useCallback((deliveryId) => {
        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId
                    ? {
                        ...delivery,
                        status: DELIVERY_STATUS.SHIPPED,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )
    }, [])

    // Generate OTP for delivery confirmation
    const generateDeliveryOTP = useCallback((deliveryId) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        setDeliveries(prev =>
            prev.map(delivery =>
                delivery.deliveryId === deliveryId
                    ? {
                        ...delivery,
                        otp,
                        updatedAt: new Date().toISOString()
                    }
                    : delivery
            )
        )

        return otp
    }, [])

    // Confirm delivery with OTP
    const confirmDelivery = useCallback((deliveryId, providedOTP) => {
        const delivery = deliveries.find(d => d.deliveryId === deliveryId)

        if (!delivery) {
            return { success: false, message: 'Delivery not found' }
        }

        if (delivery.otp !== providedOTP) {
            return { success: false, message: 'Invalid OTP' }
        }

        setDeliveries(prev =>
            prev.map(d =>
                d.deliveryId === deliveryId
                    ? {
                        ...d,
                        status: DELIVERY_STATUS.DELIVERED,
                        deliveryTimestamp: new Date().toISOString(),
                        otp: null,
                        updatedAt: new Date().toISOString()
                    }
                    : d
            )
        )

        return { success: true, message: 'Delivery confirmed successfully' }
    }, [deliveries])

    // Get deliveries by user
    const getUserDeliveries = useCallback((userId) => {
        return deliveries.filter(d => d.userId === userId)
    }, [deliveries])

    // Get delivery by ID
    const getDelivery = useCallback(
        (deliveryId) => {
            return deliveries.find(d => d.deliveryId === deliveryId)
        },
        [deliveries]
    )

    // Get deliveries by status
    const getDeliveriesByStatus = useCallback(
        (status) => {
            return deliveries.filter(d => d.status === status)
        },
        [deliveries]
    )

    // Get deliveries assigned to rider
    const getRiderDeliveries = useCallback(
        (riderId, type = 'pickup') => {
            return deliveries.filter(d =>
                type === 'pickup'
                    ? d.pickupRiderId === riderId
                    : d.deliveryRiderId === riderId
            )
        },
        [deliveries]
    )

    return (
        <DeliveryContext.Provider
            value={{
                deliveries,
                selectedDelivery,
                setSelectedDelivery,
                createDelivery,
                updateDeliveryStatus,
                assignPickupRider,
                assignDeliveryRider,
                pickupProduct,
                reachWarehouse,
                shipToDestination,
                generateDeliveryOTP,
                confirmDelivery,
                getUserDeliveries,
                getDelivery,
                getDeliveriesByStatus,
                getRiderDeliveries
            }}
        >
            {children}
        </DeliveryContext.Provider>
    )
}

export function useDelivery() {
    const context = useContext(DeliveryContext)
    if (context === undefined) {
        throw new Error('useDelivery must be used within a DeliveryProvider')
    }
    return context
}
