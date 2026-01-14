'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Invoice({ order, reference = null }) {
    const invoiceRef = useRef(null)
    const [isGenerating, setIsGenerating] = useState(false)

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
                imageTimeout: 10000
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

            pdf.save(`Invoice-${order.id}.pdf`)
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
                <title>Invoice ${order.id}</title>
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
        const shipping = subtotal > 100 ? 0 : 10
        const tax = subtotal * 0.1
        const total = subtotal + shipping + tax

        return { subtotal, shipping, tax, total }
    }

    const { subtotal, shipping, tax, total } = calculateTotals()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        background: '#7c3aed',
                        opacity: isGenerating ? 0.6 : 1,
                        transition: 'all 300ms'
                    }}
                >
                    <Download size={16} />
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                    onClick={handlePrint}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        backgroundColor: '#f5f5f5',
                        color: '#342e35',
                        borderRadius: '8px',
                        fontWeight: '600',
                        border: '2px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'all 300ms'
                    }}
                >
                    <Printer size={16} />
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
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    paddingBottom: '32px',
                    borderBottom: '2px solid #d1d5db'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            margin: '0 0 8px 0',
                            color: '#111827'
                        }}>INVOICE</h1>
                        <p style={{
                            color: '#666666',
                            fontSize: '14px',
                            margin: '0'
                        }}>
                            Order ID: <span style={{
                                fontWeight: '600',
                                color: '#111827'
                            }}>#{order.id}</span>
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px',
                            background: '#7c3aed',
                            color: 'white'
                        }}>
                            <span style={{
                                fontWeight: '700',
                                fontSize: '28px',
                                margin: '0',
                                lineHeight: '1'
                            }}>📦</span>
                        </div>
                        <p style={{
                            color: '#666666',
                            fontSize: '12px',
                            margin: '0'
                        }}>
                            Invoice Date: <span style={{
                                fontWeight: '600',
                                color: '#111827'
                            }}>{new Date().toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>

                {/* Company & Customer Info */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '32px',
                    marginBottom: '32px'
                }}>
                    {/* Company Info */}
                    <div>
                        <h3 style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666666',
                            textTransform: 'uppercase',
                            margin: '0 0 12px 0'
                        }}>From</h3>
                        <div style={{ color: '#111827' }}>
                            <p style={{
                                fontWeight: '700',
                                fontSize: '16px',
                                margin: '0'
                            }}>Your Store Name</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '4px 0'
                            }}>123 Business Street</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '0'
                            }}>City, State 12345</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '8px 0 0 0'
                            }}>contact@yourstore.com</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '0'
                            }}>+1 (555) 123-4567</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h3 style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666666',
                            textTransform: 'uppercase',
                            margin: '0 0 12px 0'
                        }}>Bill To</h3>
                        <div style={{ color: '#111827' }}>
                            <p style={{
                                fontWeight: '700',
                                fontSize: '16px',
                                margin: '0'
                            }}>{order.customerName || 'Customer Name'}</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '4px 0'
                            }}>{order.shippingAddress.street}</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '0'
                            }}>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '0'
                            }}>{order.shippingAddress.country}</p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                margin: '8px 0 0 0'
                            }}>{order.customerEmail || 'email@example.com'}</p>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '32px',
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px'
                }}>
                    <div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666666',
                            textTransform: 'uppercase',
                            margin: '0 0 4px 0'
                        }}>Order Date</p>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }}>{order.date}</p>
                    </div>
                    <div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666666',
                            textTransform: 'uppercase',
                            margin: '0 0 4px 0'
                        }}>Order Status</p>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#111827',
                            textTransform: 'capitalize',
                            margin: '0'
                        }}>{order.status}</p>
                    </div>
                    <div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#666666',
                            textTransform: 'uppercase',
                            margin: '0 0 4px 0'
                        }}>Payment Method</p>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }}>{order.paymentMethod}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div style={{ marginBottom: '32px' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: '#111827',
                                color: 'white'
                            }}>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>Description</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>Qty</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'right',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>Unit Price</th>
                                <th style={{
                                    padding: '12px 16px',
                                    textAlign: 'right',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff'
                                    }}
                                >
                                    <td style={{
                                        padding: '16px',
                                        color: '#111827'
                                    }}>
                                        <p style={{
                                            fontWeight: '600',
                                            color: '#111827',
                                            margin: '0'
                                        }}>{item.name}</p>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#666666',
                                            margin: '4px 0 0 0'
                                        }}>Item ID: {item.id}</p>
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#111827',
                                        fontWeight: '600'
                                    }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'right',
                                        color: '#111827',
                                        fontWeight: '600'
                                    }}>
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td style={{
                                        padding: '16px',
                                        textAlign: 'right',
                                        color: '#111827',
                                        fontWeight: '700'
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
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <span style={{
                                    color: '#666666',
                                    fontWeight: '500'
                                }}>Subtotal</span>
                                <span style={{
                                    color: '#111827',
                                    fontWeight: '600'
                                }}>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <span style={{
                                    color: '#666666',
                                    fontWeight: '500'
                                }}>Shipping</span>
                                <span style={{
                                    color: '#111827',
                                    fontWeight: '600'
                                }}>
                                    {shipping === 0 ? <span style={{ color: '#22c55e' }}>FREE</span> : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <span style={{
                                    color: '#666666',
                                    fontWeight: '500'
                                }}>Tax (10%)</span>
                                <span style={{
                                    color: '#111827',
                                    fontWeight: '600'
                                }}>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                backgroundColor: '#111827',
                                color: 'white',
                                borderRadius: '8px',
                                marginTop: '16px'
                            }}>
                                <span style={{ fontWeight: '700' }}>TOTAL</span>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{
                    borderTop: '2px solid #d1d5db',
                    paddingTop: '24px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '24px'
                    }}>
                        <div>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#666666',
                                textTransform: 'uppercase',
                                margin: '0 0 8px 0'
                            }}>Shipping Address</h4>
                            <p style={{
                                fontSize: '12px',
                                color: '#666666',
                                lineHeight: '1.6',
                                margin: '0'
                            }}>
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                {order.shippingAddress.country}
                            </p>
                        </div>
                        <div>
                            <h4 style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#666666',
                                textTransform: 'uppercase',
                                margin: '0 0 8px 0'
                            }}>Payment Details</h4>
                            <p style={{
                                fontSize: '12px',
                                color: '#666666',
                                lineHeight: '1.6',
                                margin: '0'
                            }}>
                                Method: {order.paymentMethod}<br />
                                Status: <span style={{
                                    fontWeight: '600',
                                    textTransform: 'capitalize'
                                }}>{order.status}</span>
                            </p>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#1e3a8a',
                            lineHeight: '1.5',
                            margin: '0'
                        }}>
                            <span style={{ fontWeight: '600' }}>Thank you for your purchase!</span> Your order will be processed within 24 hours.
                            For any inquiries, please contact our support team at support@yourstore.com or call +1 (555) 123-4567.
                        </p>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#666666',
                            margin: '0'
                        }}>
                            This is a computer-generated invoice. No signature is required.
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#666666',
                            margin: '8px 0 0 0'
                        }}>
                            © 2024 Your Store Name. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
