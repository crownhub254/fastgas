/**
 * Africa's Talking SMS Configuration
 * SMS notifications for order updates, delivery status, etc.
 * 
 * Setup:
 * 1. Create account at https://africastalking.com/
 * 2. Get API credentials from dashboard
 * 3. Add to .env.local:
 *    - AFRICASTALKING_API_KEY=your_api_key
 *    - AFRICASTALKING_USERNAME=your_username (use 'sandbox' for testing)
 *    - AFRICASTALKING_SENDER_ID=your_sender_id (optional, for custom sender)
 */

let sms = null;

/**
 * Initialize Africa's Talking SDK lazily
 */
function initSMS() {
    if (sms) return sms;
    
    if (!process.env.AFRICASTALKING_API_KEY) {
        return null;
    }

    try {
        const AfricasTalking = require('africastalking');
        const credentials = {
            apiKey: process.env.AFRICASTALKING_API_KEY,
            username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
        };
        const AT = AfricasTalking(credentials);
        sms = AT.SMS;
        return sms;
    } catch (error) {
        console.error('Failed to initialize Africa\'s Talking:', error);
        return null;
    }
}

/**
 * Send SMS notification
 * @param {string} to - Phone number in international format (+254XXXXXXXXX)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - SMS send result
 */
export async function sendSMS(to, message) {
    const smsClient = initSMS();
    
    if (!smsClient) {
        console.log('📱 [SMS MOCK] Would send to', to, ':', message);
        return { 
            success: true, 
            mock: true, 
            message: 'SMS not sent - API key not configured' 
        };
    }

    try {
        // Format phone number
        let formattedPhone = to;
        if (to.startsWith('0')) {
            formattedPhone = '+254' + to.substring(1);
        } else if (!to.startsWith('+')) {
            formattedPhone = '+' + to;
        }

        const result = await smsClient.send({
            to: [formattedPhone],
            message: message,
            from: process.env.AFRICASTALKING_SENDER_ID || '',
        });

        console.log('✅ SMS sent successfully:', result);
        return { success: true, result };
    } catch (error) {
        console.error('❌ SMS send failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send order confirmation SMS
 * @param {string} phone - Customer phone number
 * @param {string} orderId - Order ID
 * @param {number} total - Order total
 */
export async function sendOrderConfirmationSMS(phone, orderId, total) {
    const message = `FastGas Order Confirmed! Order #${orderId.slice(-8).toUpperCase()}. Total: KES ${total.toLocaleString()}. Track at fastgas.co.ke/track`;
    return sendSMS(phone, message);
}

/**
 * Send payment confirmation SMS
 * @param {string} phone - Customer phone number
 * @param {string} orderId - Order ID
 * @param {number} amount - Amount paid
 * @param {string} mpesaCode - M-Pesa transaction code
 */
export async function sendPaymentConfirmationSMS(phone, orderId, amount, mpesaCode) {
    const message = `FastGas Payment Received! KES ${amount.toLocaleString()} for Order #${orderId.slice(-8).toUpperCase()}. M-Pesa: ${mpesaCode}. Thank you!`;
    return sendSMS(phone, message);
}

/**
 * Send order shipped SMS
 * @param {string} phone - Customer phone number
 * @param {string} orderId - Order ID
 * @param {string} riderName - Rider name
 * @param {string} riderPhone - Rider phone number
 */
export async function sendOrderShippedSMS(phone, orderId, riderName, riderPhone) {
    const message = `FastGas: Your order #${orderId.slice(-8).toUpperCase()} is on the way! Rider: ${riderName} (${riderPhone}). Track at fastgas.co.ke/track`;
    return sendSMS(phone, message);
}

/**
 * Send delivery confirmation SMS
 * @param {string} phone - Customer phone number
 * @param {string} orderId - Order ID
 */
export async function sendDeliveryConfirmationSMS(phone, orderId) {
    const message = `FastGas: Order #${orderId.slice(-8).toUpperCase()} has been delivered! Thank you for shopping with us. Rate your experience at fastgas.co.ke/review`;
    return sendSMS(phone, message);
}

/**
 * Send rider assignment SMS
 * @param {string} phone - Rider phone number
 * @param {string} orderId - Order ID
 * @param {string} address - Delivery address
 */
export async function sendRiderAssignmentSMS(phone, orderId, address) {
    const message = `FastGas Delivery: New order #${orderId.slice(-8).toUpperCase()} assigned to you. Deliver to: ${address.substring(0, 50)}. Check your app for details.`;
    return sendSMS(phone, message);
}

/**
 * Send reseller approval SMS
 * @param {string} phone - Reseller phone number
 * @param {string} tier - Approved tier
 */
export async function sendResellerApprovalSMS(phone, tier) {
    const message = `Congratulations! Your FastGas Reseller application is APPROVED! Tier: ${tier}. Login to access special pricing and start selling!`;
    return sendSMS(phone, message);
}

const smsService = {
    sendSMS,
    sendOrderConfirmationSMS,
    sendPaymentConfirmationSMS,
    sendOrderShippedSMS,
    sendDeliveryConfirmationSMS,
    sendRiderAssignmentSMS,
    sendResellerApprovalSMS,
};

export default smsService;
