// M-Pesa Daraja API Configuration
// STK Push (Lipa Na M-Pesa Online) Integration

const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passkey: process.env.MPESA_PASSKEY,
    shortcode: process.env.MPESA_SHORTCODE || '174379',
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
};

// Base URLs
const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

export function getBaseUrl() {
    return MPESA_CONFIG.environment === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

// Generate OAuth Token
export async function getAccessToken() {
    const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
            },
        });

        const data = await response.json();
        
        if (data.access_token) {
            return { success: true, token: data.access_token };
        }
        
        return { success: false, error: data.errorMessage || 'Failed to get access token' };
    } catch (error) {
        console.error('M-Pesa OAuth Error:', error);
        return { success: false, error: error.message };
    }
}

// Generate timestamp in format YYYYMMDDHHmmss
export function getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate password for STK Push
export function generatePassword(timestamp) {
    const data = `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
}

// Format phone number to 254XXXXXXXXX format
export function formatPhoneNumber(phone) {
    // Remove any spaces, dashes, or special characters
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1); // Remove +
    } else if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1); // Replace leading 0 with 254
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        cleaned = '254' + cleaned; // Add 254 prefix
    }
    
    return cleaned;
}

// Initiate STK Push
export async function initiateSTKPush({ phoneNumber, amount, orderId, accountReference }) {
    const tokenResult = await getAccessToken();
    
    if (!tokenResult.success) {
        return tokenResult;
    }

    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const url = `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`;

    const payload = {
        BusinessShortCode: MPESA_CONFIG.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires integer amounts
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: accountReference || `FastGas-${orderId}`,
        TransactionDesc: `Payment for FastGas Order ${orderId}`,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenResult.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ResponseCode === '0') {
            return {
                success: true,
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                responseDescription: data.ResponseDescription,
            };
        }

        return {
            success: false,
            error: data.errorMessage || data.ResponseDescription || 'STK Push failed',
        };
    } catch (error) {
        console.error('STK Push Error:', error);
        return { success: false, error: error.message };
    }
}

// Query STK Push status
export async function querySTKPushStatus(checkoutRequestId) {
    const tokenResult = await getAccessToken();
    
    if (!tokenResult.success) {
        return tokenResult;
    }

    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const url = `${getBaseUrl()}/mpesa/stkpushquery/v1/query`;

    const payload = {
        BusinessShortCode: MPESA_CONFIG.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenResult.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        // ResultCode 0 means success
        if (data.ResultCode === '0' || data.ResultCode === 0) {
            return {
                success: true,
                status: 'completed',
                resultDesc: data.ResultDesc,
            };
        } else if (data.ResultCode === '1032') {
            return {
                success: true,
                status: 'cancelled',
                resultDesc: 'Transaction cancelled by user',
            };
        } else if (data.errorCode === '500.001.1001') {
            return {
                success: true,
                status: 'pending',
                resultDesc: 'Transaction is still being processed',
            };
        }

        return {
            success: false,
            status: 'failed',
            error: data.ResultDesc || data.errorMessage || 'Query failed',
        };
    } catch (error) {
        console.error('STK Query Error:', error);
        return { success: false, error: error.message };
    }
}

export default MPESA_CONFIG;
