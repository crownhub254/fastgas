const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter
 * @returns {Object} - Nodemailer transporter
 */
function createTransporter() {
    // For production SendGrid support
    if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    // Gmail/General SMTP configuration
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // false for port 587, true for 465
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // For development
        },
        family: 4 // Force IPv4
    });
}

/**
 * Generates HTML email template matching your order structure
 * @param {Object} options - Email data
 * @returns {string} - HTML template
 */
function generateEmailTemplate({ order, payment, customerEmail }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Order Confirmed! 🎉</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">Thank you for your purchase</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; position: relative;">
                <span style="color: #ffffff; font-size: 48px; line-height: 80px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px;">Order Details</h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 10px; color: #64748b; font-size: 14px;">Order ID:</td>
                  <td style="padding: 10px; color: #1e293b; font-size: 14px; font-weight: bold; text-align: right;">${order.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #64748b; font-size: 14px;">Transaction ID:</td>
                  <td style="padding: 10px; color: #1e293b; font-size: 14px; font-family: monospace; text-align: right;">${payment.transactionId.slice(0, 20)}...</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #64748b; font-size: 14px;">Date:</td>
                  <td style="padding: 10px; color: #1e293b; font-size: 14px; text-align: right;">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #64748b; font-size: 14px;">Payment Method:</td>
                  <td style="padding: 10px; color: #1e293b; font-size: 14px; text-align: right;">${payment.paymentMethod}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px;">Items Ordered</h2>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                ${order.items.map(item => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 15px 0;">
                      <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${item.name}</p>
                      <p style="margin: 5px 0 0; color: #64748b; font-size: 12px;">Qty: ${item.quantity}</p>
                    </td>
                    <td style="padding: 15px 0; text-align: right;">
                      <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</p>
                      <p style="margin: 5px 0 0; color: #64748b; font-size: 12px;">$${item.price.toFixed(2)} each</p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px 30px">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subtotal:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Shipping:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tax:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">$${order.tax.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #cbd5e1;">
                  <td style="padding: 15px 0 0; color: #1e293b; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 15px 0 0; color: #4F46E5; font-size: 20px; font-weight: bold; text-align: right;">$${payment.amount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address - Fixed for your order structure -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">Shipping Address</h2>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                ${order.shippingAddress.street || ''}<br>
                ${order.shippingAddress.city || ''}, ${order.shippingAddress.district || ''}<br>
                ${order.shippingAddress.division || ''} ${order.shippingAddress.zipCode || ''}<br>
                ${order.shippingAddress.country || 'Bangladesh'}
              </p>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${process.env.FRONTEND_URL}/orders/${order.orderId}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Order Details</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">Need help? Contact us at <a href="mailto:support@fastgashub.com" style="color: #4F46E5; text-decoration: none;">support@fastgashub.com</a></p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 ShopHub. All rights reserved.</p>
              <p style="margin: 10px 0 0; color: #94a3b8; font-size: 12px;">
                <a href="${process.env.FRONTEND_URL}/help" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Help</a> |
                <a href="${process.env.FRONTEND_URL}/shipping" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Shipping</a> |
                <a href="${process.env.FRONTEND_URL}/returns" style="color: #94a3b8; text-decoration: none; margin: 0 10px;">Returns</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends order confirmation email with invoice attachment
 * @param {Object} options - Email options
 * @param {string} options.customerEmail - Recipient email
 * @param {Object} options.order - Order details
 * @param {Object} options.payment - Payment details
 * @param {Buffer} options.invoicePDF - Invoice PDF buffer
 * @returns {Promise<Object>} - Send result
 */
async function sendOrderConfirmationEmail({ customerEmail, order, payment, invoicePDF }) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'ShopHub',
                address: process.env.EMAIL_FROM || process.env.EMAIL_USER
            },
            to: customerEmail,
            subject: `Order Confirmation - ${order.orderId}`,
            html: generateEmailTemplate({ order, payment, customerEmail }),
            attachments: [
                {
                    filename: `Invoice-${order.orderId}.pdf`,
                    content: invoicePDF,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully:', {
            messageId: info.messageId,
            recipient: customerEmail,
            orderId: order.orderId
        });

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

/**
 * Verifies email configuration
 * @returns {Promise<boolean>}
 */
async function verifyEmailConfig() {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration verified');
        return true;
    } catch (error) {
        console.error('❌ Email configuration failed:', error.message);
        return false;
    }
}

module.exports = {
    sendOrderConfirmationEmail,
    verifyEmailConfig
};
