'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { useRef, useState, useEffect } from 'react'
import { Download, Printer, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Invoice({ order }) {
    const invoiceRef = useRef(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [transactionId, setTransactionId] = useState(null)

    useEffect(() => {
        // Fetch transaction ID if payment was made
        if (order.transactionId) {
            setTransactionId(order.transactionId)
        } else if (order.orderId) {
            fetchTransactionId()
        }
    }, [order])

    const fetchTransactionId = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/order/${order.orderId}`
            )
            const data = await response.json()
            if (data.success && data.payment) {
                setTransactionId(data.payment.transactionId)
            }
        } catch (error) {
            console.error('Error fetching transaction ID:', error)
        }
    }

    const generatePDF = async () => {
        if (!invoiceRef.current) return
        setIsGenerating(true)

        try {
            const invoiceElement = invoiceRef.current

            const canvas = await html2canvas(invoiceElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                imageTimeout: 10000,
                ignoreElements: (element) => {
                    return element.classList?.contains('no-pdf')
                }
            })

            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= 297

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= 297
            }

            pdf.save(`FastGasHub-Invoice-${order.orderId}.pdf`)
            toast.success('Invoice downloaded successfully!')
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePrint = () => {
        if (!invoiceRef.current) return
        const printWindow = window.open('', '', 'height=600,width=800')
        const printContent = invoiceRef.current.innerHTML
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>FastGasHub Invoice ${order.orderId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
        }, 300)
    }

    const calculateTotals = () => {
        const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const shipping = order.shipping || (subtotal > 100 ? 0 : 10)
        const tax = order.tax || (subtotal * 0.1)
        const total = order.total || (subtotal + shipping + tax)

        return { subtotal, shipping, tax, total }
    }

    const { subtotal, shipping, tax, total } = calculateTotals()

    return (
        <div className="flex flex-col gap-4">
            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap no-pdf">
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-base-100 text-base-content px-6 py-3 rounded-lg font-semibold hover:bg-base-300 transition-all duration-200 border-2 border-base-300"
                >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                </button>
            </div>

            {/* Invoice Container */}
            <div
                ref={invoiceRef}
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
            >
                {/* Header with Logo and Invoice Title */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '30px',
                    paddingBottom: '25px',
                    borderBottom: '3px solid #7c3aed'
                }}>
                    <div>
                        <div style={{
                            fontSize: '42px',
                            fontWeight: '800',
                            color: '#7c3aed',
                            marginBottom: '8px',
                            letterSpacing: '-1px'
                        }}>FastGasHub</div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '4px'
                        }}>INVOICE</div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666666'
                        }}>
                            Order: <span style={{ fontWeight: '700', color: '#111827' }}>#{order.orderId}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#dcfce7',
                            borderRadius: '8px',
                            marginBottom: '12px'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#22c55e',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}></span>
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#166534',
                                textTransform: 'uppercase'
                            }}>{order.status}</span>
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#666666'
                        }}>
                            Invoice Date: <span style={{ fontWeight: '600', color: '#111827' }}>
                                {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transaction Badge (if available) */}
                {transactionId && (
                    <div style={{
                        backgroundColor: '#eff6ff',
                        border: '2px solid #3b82f6',
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{
                                fontSize: '20px',
                                color: 'white'
                            }}>✓</span>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#1e3a8a',
                                marginBottom: '2px'
                            }}>Payment Verified</div>
                            <div style={{
                                fontSize: '11px',
                                color: '#3b82f6'
                            }}>
                                Transaction ID: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                                    {transactionId}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Company & Customer Info */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    marginBottom: '32px'
                }}>
                    {/* Company Info */}
                    <div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#7c3aed',
                            textTransform: 'uppercase',
                            marginBottom: '12px',
                            letterSpacing: '1px'
                        }}>From</div>
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#faf5ff',
                            borderRadius: '8px',
                            borderLeft: '4px solid #7c3aed'
                        }}>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '18px',
                                color: '#111827',
                                marginBottom: '8px'
                            }}>FastGasHub</div>
                            <div style={{
                                fontSize: '13px',
                                color: '#666666',
                                lineHeight: '1.6'
                            }}>
                                123 E-Commerce Street<br />
                                Digital City, DC 12345<br />
                                Bangladesh<br />
                                <br />
                                <span style={{ fontWeight: '600' }}>Email:</span> support@FastGasHub.com<br />
                                <span style={{ fontWeight: '600' }}>Phone:</span> +880 1234-567890
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#7c3aed',
                            textTransform: 'uppercase',
                            marginBottom: '12px',
                            letterSpacing: '1px'
                        }}>Bill To</div>
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            borderLeft: '4px solid #6b7280'
                        }}>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '18px',
                                color: '#111827',
                                marginBottom: '8px'
                            }}>{order.customerName || 'Valued Customer'}</div>
                            <div style={{
                                fontSize: '13px',
                                color: '#666666',
                                lineHeight: '1.6'
                            }}>
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.district}<br />
                                {order.shippingAddress.division} {order.shippingAddress.zipCode}<br />
                                {order.shippingAddress.country}
                                {order.customerEmail && (
                                    <>
                                        <br /><br />
                                        <span style={{ fontWeight: '600' }}>Email:</span> {order.customerEmail}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details Summary */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '32px',
                    padding: '20px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '10px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                        }}>Order Date</div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#111827'
                        }}>
                            {new Date(order.createdAt || order.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                        }}>Payment Method</div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#111827'
                        }}>{order.paymentMethod}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                        }}>Payment Status</div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: order.paymentStatus === 'completed' ? '#22c55e' : '#f59e0b',
                            textTransform: 'capitalize'
                        }}>{order.paymentStatus || 'Pending'}</div>
                    </div>
                </div>

                {/* Items Table */}
                <div style={{ marginBottom: '32px' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: '#111827',
                                color: 'white'
                            }}>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Item Description</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>Qty</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'right',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>Unit Price</th>
                                <th style={{
                                    padding: '14px 16px',
                                    textAlign: 'right',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr
                                    key={item._id}
                                    style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                                    }}
                                >
                                    <td style={{
                                        padding: '16px',
                                        color: '#111827'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            marginBottom: '4px'
                                        }}>{item.name}</div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#6b7280'
                                        }}>SKU: {item.id}</div>
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827'
                                    }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'right',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827'
                                    }}>
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'right',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        color: '#111827'
                                    }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>Subtotal</span>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#111827',
                                    fontWeight: '600'
                                }}>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>Shipping</span>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: shipping === 0 ? '#22c55e' : '#111827'
                                }}>
                                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingBottom: '16px',
                                marginBottom: '16px',
                                borderBottom: '2px solid #e5e7eb'
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>Tax (10%)</span>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#111827',
                                    fontWeight: '600'
                                }}>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                backgroundColor: '#7c3aed',
                                borderRadius: '8px'
                            }}>
                                <span style={{
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: 'white',
                                    textTransform: 'uppercase'
                                }}>Total Amount</span>
                                <span style={{
                                    fontSize: '24px',
                                    fontWeight: '800',
                                    color: 'white'
                                }}>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: '24px'
                }}>
                    <div style={{
                        backgroundColor: '#dcfce7',
                        border: '2px solid #22c55e',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            color: '#166534',
                            lineHeight: '1.6'
                        }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>Thank you for shopping with FastGasHub!</span>
                            <br />
                            Your order will be processed within 24-48 hours. For any inquiries, please contact our support team at{' '}
                            <span style={{ fontWeight: '600' }}>support@FastGasHub.com</span> or call{' '}
                            <span style={{ fontWeight: '600' }}>+880 1234-567890</span>.
                        </div>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginBottom: '4px'
                        }}>
                            This is a computer-generated invoice and requires no physical signature.
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            fontWeight: '600'
                        }}>
                            © 2026 FastGasHub. All rights reserved. | Powered by innovative e-commerce solutions
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
