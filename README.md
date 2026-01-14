# 🛍️ ShopHub - Next.js E-Commerce Application

![Hero Image](./assets/hero.png)

A modern, full-stack e-commerce product showcase built with Next.js 16, featuring authentication, dynamic product listings, and protected routes.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## 📸 Product Showcase

A visual highlight of some of our featured products:

![Products Image](./assets/products.png)

## 🌟 Features

### Core Functionality
- ✅ **Landing Page** - Engaging 7-section homepage with hero, features, testimonials, and more
- ✅ **Authentication System** - Secure cookie-based mock authentication
- ✅ **Product Catalog** - Browse and filter products by category
- ✅ **Product Details** - Detailed individual product pages with full specifications
- ✅ **Add Product** - Protected form for authenticated users to add new products
- ✅ **Route Protection** - Middleware-based route guarding for protected pages

### UI/UX Features
- 🎨 Modern gradient-based design with smooth animations
- 📱 Fully responsive across all devices
- 🔔 Toast notifications for user feedback
- ⚡ Smooth page transitions with Framer Motion
- 🎯 Category filtering and product search
- 💫 Interactive hover effects and micro-animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hossain-shifat/Shop-Hub
cd ShopHub
```

2. **Install dependencies**
```bash
npm install
```

3. **Install additional required packages**
```bash
npm install framer-motion react-hot-toast js-cookie
npm install --save-dev @types/js-cookie
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
project/
├── app/
│   ├── layout.js                 # Root layout with providers
│   ├── page.js                   # Landing page (7 sections)
│   ├── globals.css               # Global styles
│   ├── login/
│   │   └── page.js              # Login page
│   ├── products/
│   │   ├── page.js              # Products listing
│   │   └── [id]/
│   │       └── page.js          # Product detail page
│   ├── add-product/
│   │   └── page.js              # Protected add product form
│   └── api/
│       ├── auth/
│       │   ├── login/route.js   # Login API endpoint
│       │   ├── logout/route.js  # Logout API endpoint
│       │   └── check/route.js   # Auth check endpoint
│       └── products/
│           ├── route.js         # Products CRUD API
│           └── [id]/route.js    # Single product API
├── components/
│   ├── Navbar.js                # Navigation component
│   └── Footer.js                # Footer component
├── lib/
│   ├── auth.js                  # Authentication utilities
│   └── products.js              # Mock product database
├── middleware.js                # Route protection middleware
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies
```

## 🔐 Authentication

### Demo Credentials
```
Email: admin@example.com
Password: admin123
```

### How It Works
1. User submits login form with credentials
2. Server validates against mock database
3. On success, httpOnly cookie is set
4. Cookie is used for route protection
5. Middleware checks authentication on protected routes
6. Unauthorized users are redirected to login

## 🛣️ Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page with 7 sections |
| `/login` | Authentication page |
| `/products` | Product catalog with filtering |
| `/products/[id]` | Individual product details |

### Protected Routes
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/add-product` | Add new product form | ✅ Yes |

### API Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | ❌ No |
| POST | `/api/auth/logout` | Logout user | ❌ No |
| GET | `/api/auth/check` | Check auth status | ❌ No |
| GET | `/api/products` | Get all products | ❌ No |
| POST | `/api/products` | Create product | ✅ Yes |
| GET | `/api/products/[id]` | Get single product | ❌ No |

## 🎨 Landing Page Sections

1. **Hero Section** - Eye-catching gradient header with CTAs
2. **Features Section** - Key value propositions with icons
3. **Product Highlights** - Featured product cards
4. **Statistics Section** - Company metrics and achievements
5. **Testimonials** - Customer reviews and ratings
6. **Call-to-Action** - Conversion-focused CTA banner
7. **Newsletter** - Email subscription form

## 💾 Data Management

### Mock Database
Products are stored in-memory using a JavaScript array. Data persists during server runtime but resets on restart.

### Adding Products
1. Login with demo credentials
2. Navigate to "Add Product" page
3. Fill in product details:
   - Name (required)
   - Description (required)
   - Price (required)
   - Stock quantity (required)
   - Category (dropdown)
   - Icon emoji (selection)
   - Features (comma-separated)
4. Submit form
5. Redirects to products page with success toast

## 🎯 Technical Highlights

### Next.js 16 Features
- **App Router** - Modern file-based routing
- **Server Components** - Optimized performance
- **API Routes** - Built-in backend functionality
- **Middleware** - Route protection and request handling

### Authentication Flow
```
User Login → Validate Credentials → Generate Token
→ Set HttpOnly Cookie → Redirect to Products
```

### Protected Route Flow
```
Access Protected Route → Middleware Checks Cookie
→ Verify Token → Allow/Deny Access
```

## 🔧 Configuration

### Tailwind CSS
Custom theme with primary (blue) and secondary (purple) color palettes. Responsive breakpoints and custom utility classes included.

### Environment
No environment variables required for basic functionality. All authentication is mock-based for development purposes.

## 📦 Dependencies

### Core Dependencies
- **next**: 16.1.1 - React framework
- **react**: 19.2.3 - UI library
- **react-dom**: 19.2.3 - React DOM bindings
- **framer-motion**: ^11.0.0 - Animation library
- **react-hot-toast**: ^2.4.1 - Toast notifications
- **js-cookie**: ^3.0.5 - Cookie management
- **html2canvas**: ^1.4.1 - Invoice
- **jspdf**: ^4.0.0 - Convert & Download Invoice
- **lucide-react**: ^0.562.0 - Icons
- **react-confetti**: ^6.4.0 - Confetti
- **daisyui**: ^5.5.14 - Style

### Dev Dependencies
- **@tailwindcss/postcss**: ^4 - Tailwind PostCSS plugin
- **tailwindcss**: ^4 - Utility-first CSS framework
- **eslint**: ^9 - Code linting
- **eslint-config-next**: 16.1.1 - Next.js ESLint config

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/hossain-shifat/Shop-Hub
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy (no configuration needed)

### Manual Deployment
```bash
npm run build
npm start
```

## 🎓 Project Requirements

### ✅ Completed Requirements
1. ✅ Landing page with 7+ sections
2. ✅ Navbar with login and products links
3. ✅ Mock authentication with cookies
4. ✅ Protected routes with middleware
5. ✅ Public product listing page
6. ✅ Individual product detail pages
7. ✅ Protected "Add Product" form
8. ✅ Toast notifications
9. ✅ Express.js API alternatives (Next.js API routes)
10. ✅ Professional README with setup instructions

### 📋 Optional Enhancements Implemented
- ✅ Category filtering on products page
- ✅ Animated transitions with Framer Motion
- ✅ Responsive mobile-first design
- ✅ Form validation on add product
- ✅ Stock quantity display
- ✅ Product rating display
- ✅ Modern gradient UI design

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Module not found: framer-motion`
```bash
npm install framer-motion
```

**Issue**: `Module not found: react-hot-toast`
```bash
npm install react-hot-toast
```

**Issue**: Authentication not persisting
- Clear browser cookies
- Ensure cookies are enabled
- Check browser console for errors

**Issue**: Port 3000 already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

## 📄 License

This project is created for educational purposes as part of an project.

## 👨‍💻 Author

**Hossain-Shifat**
- ShopHub - Next.js Full-Stack Application
- Date: January 2026

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations
- React Hot Toast for notification system

---

**Note**: This is a mock application for educational purposes. In production:
- Use proper database (MongoDB, PostgreSQL)
- Implement NextAuth.js for real authentication
- Hash passwords with bcrypt
- Add proper error handling
- Implement rate limiting
- Add input sanitization
- Use environment variables for secrets
