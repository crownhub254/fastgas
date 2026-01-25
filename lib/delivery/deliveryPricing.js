export const DELIVERY_CHARGES = {
    DOCUMENT: {
        WITHIN_CITY: 60,
        OUTSIDE_CITY: 80
    },
    NON_DOCUMENT: {
        UP_TO_3KG: {
            WITHIN_CITY: 110,
            OUTSIDE_CITY: 150
        },
        ABOVE_3KG: {
            BASE: 40,
            EXTRA_PER_KG: 40,
            OUTSIDE_CITY_EXTRA: 40
        }
    }
}

export const RIDER_COMMISSION = {
    SAME_CITY: 0.80, // 80%
    OUTSIDE_CITY: 0.60 // 60%
}

export const DELIVERY_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    READY_TO_PICKUP: 'ready-to-pickup',
    IN_TRANSIT: 'in-transit',
    REACHED_WAREHOUSE: 'reached-warehouse',
    SHIPPED: 'shipped',
    READY_FOR_DELIVERY: 'ready-for-delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
}

export const PRODUCT_TYPE = {
    DOCUMENT: 'document',
    NON_DOCUMENT: 'non-document'
}

/**
 * Calculate delivery charge based on product details
 * @param {Object} params - Delivery parameters
 * @param {string} params.productType - 'document' or 'non-document'
 * @param {number} params.weight - Weight in kg (optional for documents)
 * @param {boolean} params.isWithinCity - Whether delivery is within city
 * @returns {number} Delivery charge in Taka
 */
export const calculateDeliveryCharge = ({
    productType,
    weight = 0,
    isWithinCity
}) => {
    if (productType === PRODUCT_TYPE.DOCUMENT) {
        return isWithinCity
            ? DELIVERY_CHARGES.DOCUMENT.WITHIN_CITY
            : DELIVERY_CHARGES.DOCUMENT.OUTSIDE_CITY
    }

    if (productType === PRODUCT_TYPE.NON_DOCUMENT) {
        if (weight <= 3) {
            return isWithinCity
                ? DELIVERY_CHARGES.NON_DOCUMENT.UP_TO_3KG.WITHIN_CITY
                : DELIVERY_CHARGES.NON_DOCUMENT.UP_TO_3KG.OUTSIDE_CITY
        } else {
            const extraKg = weight - 3
            let charge = DELIVERY_CHARGES.NON_DOCUMENT.ABOVE_3KG.BASE
            charge += extraKg * DELIVERY_CHARGES.NON_DOCUMENT.ABOVE_3KG.EXTRA_PER_KG

            if (!isWithinCity) {
                charge += DELIVERY_CHARGES.NON_DOCUMENT.ABOVE_3KG.OUTSIDE_CITY_EXTRA
            }

            return charge
        }
    }

    return 0
}

/**
 * Determine if delivery is within city
 * @param {Object} params - Location parameters
 * @param {string} params.pickupDistrict - Pickup district
 * @param {string} params.deliveryDistrict - Delivery district
 * @returns {boolean} True if within city
 */
export const isWithinCity = ({ pickupDistrict, deliveryDistrict }) => {
    return pickupDistrict === deliveryDistrict
}

/**
 * Calculate rider commission
 * @param {number} deliveryCharge - Total delivery charge
 * @param {boolean} isWithinCity - Whether delivery is within city
 * @returns {number} Rider's commission
 */
export const calculateRiderCommission = (deliveryCharge, isWithinCity) => {
    const commissionRate = isWithinCity
        ? RIDER_COMMISSION.SAME_CITY
        : RIDER_COMMISSION.OUTSIDE_CITY

    return Math.round(deliveryCharge * commissionRate * 100) / 100
}

/**
 * Get delivery status display info
 * @param {string} status - Current delivery status
 * @returns {Object} Status info with icon, color, and message
 */
export const getStatusInfo = (status) => {
    const statusMap = {
        [DELIVERY_STATUS.UNPAID]: {
            icon: 'Clock',
            color: 'warning',
            label: 'Unpaid',
            message: 'Awaiting payment'
        },
        [DELIVERY_STATUS.PAID]: {
            icon: 'CheckCircle',
            color: 'info',
            label: 'Paid',
            message: 'Payment received'
        },
        [DELIVERY_STATUS.READY_TO_PICKUP]: {
            icon: 'Package',
            color: 'info',
            label: 'Ready to Pickup',
            message: 'Waiting for rider pickup'
        },
        [DELIVERY_STATUS.IN_TRANSIT]: {
            icon: 'Truck',
            color: 'primary',
            label: 'In Transit',
            message: 'Product on the way'
        },
        [DELIVERY_STATUS.REACHED_WAREHOUSE]: {
            icon: 'Warehouse',
            color: 'info',
            label: 'Warehouse',
            message: 'At warehouse'
        },
        [DELIVERY_STATUS.SHIPPED]: {
            icon: 'Truck',
            color: 'primary',
            label: 'Shipped',
            message: 'Shipped to destination'
        },
        [DELIVERY_STATUS.READY_FOR_DELIVERY]: {
            icon: 'Package',
            color: 'warning',
            label: 'Ready for Delivery',
            message: 'Out for delivery'
        },
        [DELIVERY_STATUS.DELIVERED]: {
            icon: 'CheckCircle',
            color: 'success',
            label: 'Delivered',
            message: 'Delivery completed'
        },
        [DELIVERY_STATUS.CANCELLED]: {
            icon: 'XCircle',
            color: 'error',
            label: 'Cancelled',
            message: 'Delivery cancelled'
        }
    }

    return statusMap[status] || statusMap[DELIVERY_STATUS.UNPAID]
}
