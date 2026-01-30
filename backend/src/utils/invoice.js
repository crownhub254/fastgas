const PDFDocument = require('pdfkit');

/**
 * Generates an invoice PDF buffer matching FastGasHub design
 * @param {Object} options - Invoice data
 * @param {Object} options.order - Order details
 * @param {Object} options.payment - Payment details
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generateInvoice({ order, payment }) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            const chunks = [];

            // Collect PDF data
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Calculate totals
            const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shipping = order.shipping !== undefined ? order.shipping : (subtotal > 100 ? 0 : 10);
            const tax = order.tax || (subtotal * 0.1);
            const total = order.total || (subtotal + shipping + tax);

            // --- HEADER ---
            doc
                .fontSize(32)
                .font('Helvetica-Bold')
                .fillColor('#7c3aed')
                .text('FastGasHub', 50, 50);

            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text('INVOICE', 50, 90);

            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor('#666666')
                .text(`Order: #${order.orderId}`, 50, 110);

            // Status Badge (right aligned)
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#166534')
                .text(order.status.toUpperCase(), 450, 60, { align: 'right' });

            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#666666')
                .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}`, 350, 85, { align: 'right', width: 195 });

            // Divider
            doc
                .moveTo(50, 135)
                .lineTo(545, 135)
                .strokeColor('#7c3aed')
                .lineWidth(3)
                .stroke();

            // --- PAYMENT VERIFICATION BADGE ---
            if (payment && payment.transactionId) {
                const badgeY = 150;

                doc
                    .roundedRect(50, badgeY, 495, 45, 5)
                    .fillAndStroke('#eff6ff', '#3b82f6');

                doc
                    .circle(75, badgeY + 22.5, 15)
                    .fill('#3b82f6');

                doc
                    .fontSize(16)
                    .fillColor('#ffffff')
                    .text('✓', 68, badgeY + 14);

                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .fillColor('#1e3a8a')
                    .text('Payment Verified', 100, badgeY + 12);

                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#3b82f6')
                    .text(`Transaction ID: ${payment.transactionId}`, 100, badgeY + 28);
            }

            // --- FROM & BILL TO ---
            const infoY = payment ? 220 : 165;

            // From Section
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#7c3aed')
                .text('FROM', 50, infoY);

            doc
                .roundedRect(50, infoY + 15, 230, 130, 4)
                .fillAndStroke('#faf5ff', '#faf5ff');

            doc
                .moveTo(50, infoY + 15)
                .lineTo(50, infoY + 145)
                .strokeColor('#7c3aed')
                .lineWidth(4)
                .stroke();

            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text('FastGasHub', 60, infoY + 25);

            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#666666')
                .text('123 E-Commerce Street', 60, infoY + 50)
                .text('Digital City, DC 12345', 60, infoY + 65)
                .text('Bangladesh', 60, infoY + 80)
                .text('Email: support@FastGasHub.com', 60, infoY + 100)
                .text('Phone: +880 1234-567890', 60, infoY + 115);

            // Bill To Section
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#7c3aed')
                .text('BILL TO', 315, infoY);

            doc
                .roundedRect(315, infoY + 15, 230, 130, 4)
                .fillAndStroke('#f9fafb', '#f9fafb');

            doc
                .moveTo(315, infoY + 15)
                .lineTo(315, infoY + 145)
                .strokeColor('#6b7280')
                .lineWidth(4)
                .stroke();

            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text('Valued Customer', 325, infoY + 25);

            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#666666')
                .text(order.shippingAddress?.street || '', 325, infoY + 50)
                .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.district || ''}`, 325, infoY + 65)
                .text(`${order.shippingAddress?.division || ''} ${order.shippingAddress?.zipCode || ''}`, 325, infoY + 80)
                .text(order.shippingAddress?.country || 'Bangladesh', 325, infoY + 95);

            // --- ORDER DETAILS SUMMARY ---
            const summaryY = infoY + 165;

            doc
                .roundedRect(50, summaryY, 495, 50, 5)
                .fill('#f3f4f6');

            // Order Date
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#6b7280')
                .text('ORDER DATE', 80, summaryY + 12, { align: 'center', width: 135 });

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text(new Date(order.createdAt).toLocaleDateString(), 80, summaryY + 28, { align: 'center', width: 135 });

            // Payment Method
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#6b7280')
                .text('PAYMENT METHOD', 230, summaryY + 12, { align: 'center', width: 135 });

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text(order.paymentMethod || payment.paymentMethod, 230, summaryY + 28, { align: 'center', width: 135 });

            // Payment Status
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#6b7280')
                .text('PAYMENT STATUS', 380, summaryY + 12, { align: 'center', width: 135 });

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor(order.paymentStatus === 'completed' ? '#22c55e' : '#f59e0b')
                .text((order.paymentStatus || 'pending').toUpperCase(), 380, summaryY + 28, { align: 'center', width: 135 });

            // --- ITEMS TABLE ---
            const tableTop = summaryY + 70;

            // Table Header
            doc
                .rect(50, tableTop, 495, 30)
                .fillAndStroke('#111827', '#111827');

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .text('ITEM DESCRIPTION', 60, tableTop + 10)
                .text('QTY', 340, tableTop + 10, { align: 'center', width: 60 })
                .text('UNIT PRICE', 420, tableTop + 10, { align: 'right', width: 60 })
                .text('AMOUNT', 495, tableTop + 10, { align: 'right', width: 45 });

            // Table Rows
            let yPosition = tableTop + 40;

            order.items.forEach((item, index) => {
                const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

                doc
                    .rect(50, yPosition - 5, 495, 35)
                    .fillAndStroke(rowColor, '#e5e7eb');

                doc
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .fillColor('#111827')
                    .text(item.name, 60, yPosition, { width: 260, ellipsis: true });

                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#6b7280')
                    .text(`SKU: ${item.id || item.productId || 'N/A'}`, 60, yPosition + 15);

                doc
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .fillColor('#111827')
                    .text(item.quantity.toString(), 340, yPosition + 5, { align: 'center', width: 60 })
                    .text(`$${item.price.toFixed(2)}`, 420, yPosition + 5, { align: 'right', width: 60 })
                    .text(`$${(item.price * item.quantity).toFixed(2)}`, 495, yPosition + 5, { align: 'right', width: 45 });

                yPosition += 40;
            });

            // --- TOTALS ---
            const totalsY = yPosition + 20;

            doc
                .roundedRect(345, totalsY, 200, 120, 5)
                .fillAndStroke('#f9fafb', '#e5e7eb');

            // Subtotal
            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Subtotal', 360, totalsY + 15)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text(`$${subtotal.toFixed(2)}`, 360, totalsY + 15, { align: 'right', width: 170 });

            // Shipping
            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Shipping', 360, totalsY + 35)
                .font('Helvetica-Bold')
                .fillColor(shipping === 0 ? '#22c55e' : '#111827')
                .text(shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`, 360, totalsY + 35, { align: 'right', width: 170 });

            // Tax
            doc
                .fontSize(11)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Tax (10%)', 360, totalsY + 55)
                .font('Helvetica-Bold')
                .fillColor('#111827')
                .text(`$${tax.toFixed(2)}`, 360, totalsY + 55, { align: 'right', width: 170 });

            // Total
            doc
                .roundedRect(360, totalsY + 75, 170, 35, 4)
                .fill('#7c3aed');

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text('TOTAL AMOUNT', 370, totalsY + 85)
                .fontSize(16)
                .text(`$${total.toFixed(2)}`, 370, totalsY + 85, { align: 'right', width: 150 });

            // --- FOOTER ---
            const footerY = totalsY + 140;

            doc
                .moveTo(50, footerY)
                .lineTo(545, footerY)
                .strokeColor('#e5e7eb')
                .lineWidth(2)
                .stroke();

            // Thank you message
            doc
                .roundedRect(50, footerY + 15, 495, 50, 5)
                .fillAndStroke('#dcfce7', '#22c55e');

            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#166534')
                .text('Thank you for shopping with FastGasHub!', 60, footerY + 25, { width: 475 });

            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#166534')
                .text('Your order will be processed within 24-48 hours. For inquiries, contact support@FastGasHub.com or call +880 1234-567890.', 60, footerY + 42, { width: 475 });

            // Legal footer
            doc
                .fontSize(8)
                .font('Helvetica')
                .fillColor('#9ca3af')
                .text('This is a computer-generated invoice and requires no physical signature.', 50, footerY + 80, { align: 'center', width: 495 })
                .text('© 2026 FastGasHub. All rights reserved.', 50, footerY + 95, { align: 'center', width: 495 });

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateInvoice };
