# FastGasHub - N₂O Cream Charger E-Commerce Implementation Plan

## 🏢 Business Overview

FastGasHub sells **N₂O (Nitrous Oxide) cream chargers** for professional culinary use:

- **670g N₂O Cylinder** - KES 7,500 (bestselling size worldwide)
- **Pressure Regulator** - KES 2,500 (M10X1 valve compatible)
- **FastGas Creamer** - KES 15,000 (Professional all-in-one cream dispenser with integrated stand and cylinder mount)

Target customers: Professional chefs, bakeries, restaurants, catering companies, and culinary resellers.

---

## ✅ Completed Tasks

### Homepage & Branding
- [x] Full rebrand from ShopHub to FastGasHub
- [x] Advanced Framer Motion animations (parallax, particles, 3D cards)
- [x] N₂O cream charger products displayed correctly
- [x] Kenyan testimonials with Sheng flavor
- [x] Mobile responsiveness improvements
- [x] Quick dashboard access buttons for demo mode

### Dashboard Structure
- [x] Admin dashboard with correct N₂O products
- [x] Distributor dashboard (renamed from seller)
- [x] Reseller dashboard with correct pricing
- [x] Rider dashboard for deliveries
- [x] User dashboard

### Navigation & Roles
- [x] Admin nav: removed User Management, added Distributors
- [x] Renamed sellers → distributors throughout
- [x] Role-based navigation working

### Product API
- [x] Updated `/api/products` with N₂O product data
- [x] Three product variants: 670g, Regulator, Creamer
- [x] Tiered pricing (retail, reseller, wholesale)

---

## 🔧 Phase 1: Core Backend Implementation (Future)

### 1.1 Database Schema (MongoDB)

```javascript
// Product Schema
{
  name: String,           // "FastGas 670g N₂O Cylinder"
  slug: String,
  category: String,       // "cream-charger", "accessory", "equipment"
  description: String,
  retailPrice: Number,    // 7500
  resellerPrice: Number,  // 6375 (15% discount)
  wholesalePrice: Number, // 5625 (25% discount)
  stock: Number,
  sku: String,           // "FG-670G"
  images: [String],
  specifications: Object,
  isActive: Boolean
}

// User Schema
{
  uid: String,            // Firebase UID
  email: String,
  displayName: String,
  phoneNumber: String,
  role: {
    type: String,
    enum: ['user', 'reseller', 'distributor', 'rider', 'admin'],
    default: 'user'
  },
  resellerProfile: {      // Only for resellers
    businessName: String,
    businessLocation: Object,
    isApproved: Boolean,
    priceTier: String,    // 'standard', 'premium', 'wholesale'
    discount: Number,     // 15% for Gold tier, etc.
    totalSales: Number,
    totalRevenue: Number
  }
}

// Order Schema
{
  orderId: String,
  userId: String,
  resellerId: String,     // If ordered through reseller
  items: [{
    productId: String,
    name: String,
    variant: String,      // "670g Cylinder"
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  shippingFee: Number,
  total: Number,
  paymentMethod: String,  // 'mpesa', 'card', 'cod'
  paymentStatus: String,  // 'pending', 'completed', 'failed'
  orderStatus: String,    // 'pending', 'processing', 'shipped', 'delivered'
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}

// MpesaTransaction Schema
{
  orderId: String,
  phoneNumber: String,
  amount: Number,
  merchantRequestId: String,
  checkoutRequestId: String,
  mpesaReceiptNumber: String,
  transactionDate: Date,
  status: String          // 'pending', 'completed', 'failed', 'cancelled'
}
```

### 1.2 Environment Variables Needed
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Firebase Admin
FIREBASE_PROJECT_ID=fastgas-74783
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=https://fastgashub.com/api/mpesa/callback

# Stripe (optional - for card payments)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

---

## 💰 Phase 2: M-Pesa Integration

### 2.1 Files to Create
```
app/api/mpesa/
  stk-push/route.js       # Initiate STK Push
  callback/route.js       # Handle M-Pesa webhook
  status/[id]/route.js    # Check payment status
  
lib/mpesa/
  config.js               # M-Pesa credentials & helpers
  stkPush.js              # STK Push implementation
  
components/checkout/
  MpesaPayment.jsx        # M-Pesa payment form
  PaymentStatus.jsx       # Payment status display
```

### 2.2 STK Push Flow
1. User enters phone number at checkout
2. Backend initiates STK Push via Daraja API
3. User receives M-Pesa prompt on phone
4. User enters PIN to confirm
5. M-Pesa sends callback to our webhook
6. Order status updated to "paid"
7. User redirected to success page

### 2.3 M-Pesa API Endpoints
```javascript
// POST /api/mpesa/stk-push
{
  phoneNumber: "254712345678",
  amount: 7500,
  orderId: "ORD-001",
  accountReference: "FastGas-ORD001"
}

// POST /api/mpesa/callback (webhook)
// Receives M-Pesa payment confirmation

// GET /api/mpesa/status/[checkoutRequestId]
// Returns payment status
```

---

## 📊 Phase 3: Admin Dashboard Enhancements

### 3.1 Analytics Features
- [x] Sales by product (670g vs Regulator vs Creamer)
- [x] Revenue trends (daily, weekly, monthly)
- [x] Top resellers by volume
- [x] Geographic sales distribution
- [x] Inventory alerts

### 3.2 Reseller Management
- [x] Approve/reject reseller applications
- [x] Set reseller price tiers
- [x] View reseller performance
- [x] Manage commissions

### 3.3 Order Management
- [x] View all orders with filters
- [x] Update order status
- [x] Assign riders for delivery
- [x] Print invoices/receipts

---

## 🛒 Phase 4: Reseller Portal

### 4.1 Features for Resellers
- [x] View special pricing (15-25% discount)
- [x] Place bulk orders
- [x] Track order history
- [x] View earnings/commissions
- [x] Manage client relationships

### 4.2 Reseller Tiers
| Tier | Discount | Min. Monthly Order |
|------|----------|-------------------|
| Standard | 10% | 10 units |
| Premium | 15% | 25 units |
| Wholesale | 25% | 50 units |

---

## 🚚 Phase 5: Delivery & Rider System

### 5.1 Rider Features
- [x] View assigned deliveries
- [x] Update delivery status
- [x] Capture proof of delivery (photo + recipient name)
- [ ] Route optimization (future)

### 5.2 Delivery Tracking
- [x] Real-time order tracking page
- [x] SMS notifications (Africa's Talking integration)
- [x] Delivery confirmation with proof

---

## 📱 Mobile Optimization (Completed)

### Already Implemented
- [x] Responsive navigation
- [x] Touch-friendly buttons (44px min tap targets)
- [x] Mobile-first CSS utilities
- [x] Reduced motion support
- [x] Optimized animations

---

## 🔐 Security Considerations

### Authentication
- Firebase Authentication for all users
- Role-based access control
- Protected API routes
- Secure session management

### Payment Security
- M-Pesa handled through official Daraja API
- No card data stored locally (Stripe handles)
- HTTPS required for all transactions
- Webhook signature verification

---

## 📁 Key File Locations

### Frontend
```
components/
  FastGasHomePage.jsx     # Main homepage
  Navbar.jsx              # Navigation
  ProtectedRoute.jsx      # Auth wrapper

app/
  dashboard/
    admin/                # Admin pages
    distributor/          # Distributor pages
    reseller/             # Reseller pages
    rider/                # Rider pages
```

### API Routes
```
app/api/
  products/route.js       # Product CRUD
  orders/route.js         # Order management
  users/route.js          # User management
  notifications/route.js  # Notifications
```

### Configuration
```
lib/
  firebase/config.js      # Firebase setup
  mongodb/mongodb.js      # MongoDB connection
  stripe/config.js        # Stripe setup
```

---

## 🎯 Immediate Next Steps

1. **Finalize Database Design** - Confirm MongoDB schemas
2. **Set Up M-Pesa Sandbox** - Get Daraja API credentials
3. **Connect MongoDB** - Replace demo data with real database
4. **Implement User Registration** - With role selection
5. **Build Checkout Flow** - With M-Pesa integration

---

## 📞 Contact
- Phone: 0740595680
- GitHub: crownhub254/fastgas
- Firebase Project: fastgas-74783

---

*Last Updated: January 2026*
*Product Focus: N₂O Cream Chargers for Culinary Use*
