# AVANYAA - Premium Fashion eCommerce Platform

A production-ready, full-stack eCommerce web application built with Next.js for a ladies fashion brand specializing in dresses. Features a modern, UX-focused design similar to top fashion brands like Zara and H&M.

## 🚀 Features

### Core Functionality (Mandatory Features - Fully Implemented)

✅ **Wishlist System**
- Add/remove products from wishlist
- Persistent wishlist storage (localStorage for guests, database for logged-in users)
- Automatic sync after login
- Dedicated wishlist page

✅ **Search Functionality**
- Fast, optimized search by product name, description, and category
- Search bar in navbar
- Real-time results
- MongoDB text indexing for performance

✅ **Pagination**
- Server-side pagination for product listings
- Customizable items per page
- Optimized for performance with large datasets
- Page navigation controls

✅ **Analytics Dashboard (Admin)**
- Real-time data (not dummy data)
- Total orders and revenue
- Product count
- Recent orders display
- Last 7 days order trends
- MongoDB aggregation pipelines

### Customer Features

🛍️ **Shopping Experience**
- Beautiful, responsive homepage with hero section
- Category browsing (Casual, Formal, Party, Ethnic, Summer, Winter)
- Product listing with advanced filters (category, price, size, color)
- Product detail pages with image galleries
- Size and color selection
- Shopping cart with quantity management
- Guest and user checkout

💳 **Checkout & Orders**
- Guest checkout support
- Address form with validation
- Cash on Delivery (COD) payment
- Order confirmation with unique Order ID
- Order history for logged-in users
- Order status tracking

### Admin Features

🔧 **Product Management**
- Create, read, update, and delete products
- Image upload to MinIO (S3-compatible storage)
- Multiple images per product
- Category, size, and color management
- Stock tracking
- Featured products

📊 **Dashboard & Analytics**
- Real-time statistics
- Revenue tracking
- Order management
- Status updates (Placed, Shipped, Delivered, Cancelled)
- Customer information view

📧 **Email Notifications**
- Order confirmation emails (customer)
- New order alerts (admin)
- Supports Resend and Nodemailer/SMTP

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (ShadCN UI)
- **Database:** MongoDB with Mongoose
- **Storage:** MinIO (S3-compatible)
- **Authentication:** NextAuth.js
- **State Management:** Zustand
- **Email:** Resend / Nodemailer

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- MinIO (local or cloud instance)
- Email service (Resend API key or SMTP credentials)

### Step 1: Clone and Install

```bash
cd AVANYAA
npm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/avanyaa-fashion

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=avanyaa-images
MINIO_USE_SSL=false

# Email - Choose Resend OR Nodemailer
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# OR for Nodemailer/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Admin notifications
ADMIN_EMAIL=admin@avanyaa.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Set Up MongoDB

**Local MongoDB:**
```bash
# Install MongoDB and start the service
mongod --dbpath /path/to/data
```

**MongoDB Atlas:**
- Create account at mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `MONGODB_URI`

### Step 4: Set Up MinIO

**Local MinIO:**
```bash
# Download MinIO
# Windows: https://dl.min.io/server/minio/release/windows-amd64/minio.exe

# Run MinIO
minio server C:\minio-data --console-address ":9001"

# Access console at http://localhost:9001
# Default credentials: minioadmin / minioadmin
```

**MinIO Cloud:**
- Sign up at min.io
- Create bucket named `avanyaa-images`
- Update environment variables with your credentials

### Step 5: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env`

### Step 6: Email Setup

**Option A: Resend (Recommended)**
- Sign up at resend.com
- Get API key
- Add to `RESEND_API_KEY` in `.env`

**Option B: Nodemailer with Gmail**
- Enable 2-factor authentication on Gmail
- Generate app password
- Add credentials to `.env`

### Step 7: Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit http://localhost:3000

## 👤 Admin Access

### Creating an Admin User

Since the first user registration creates a regular user, you need to manually set the admin role in MongoDB:

1. Register a new account through the app
2. Connect to MongoDB:
   ```bash
   mongosh mongodb://localhost:27017/avanyaa-fashion
   ```
3. Update user role:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```
4. Log in with admin credentials
5. Access admin panel at `/admin`

## 📁 Project Structure

```
AVANYAA/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── products/         # Product CRUD
│   │   ├── orders/           # Order management
│   │   ├── wishlist/         # Wishlist operations
│   │   ├── analytics/        # Dashboard analytics
│   │   └── upload/           # Image upload
│   ├── admin/                # Admin panel pages
│   ├── products/             # Product pages
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout flow
│   ├── wishlist/             # Wishlist page
│   ├── orders/               # Order history
│   ├── auth/                 # Sign in/up pages
│   └── page.tsx              # Homepage
├── components/               # React components
│   ├── ui/                   # ShadCN UI components
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── FilterSidebar.tsx
│   └── Pagination.tsx
├── lib/                      # Utilities
│   ├── db.ts                 # MongoDB connection
│   ├── minio.ts              # MinIO client
│   ├── email.ts              # Email service
│   ├── auth.ts               # NextAuth config
│   └── utils.ts              # Helper functions
├── models/                   # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   └── Wishlist.ts
├── store/                    # Zustand stores
│   ├── cartStore.ts
│   └── wishlistStore.ts
└── types/                    # TypeScript types
```

## 🎯 Key Features Implementation

### Search
- MongoDB text indexes on product name and description
- Optimized regex search for flexibility
- Query parameter-based search in product listing

### Pagination
- Server-side pagination with configurable page size
- Total count and page calculation
- URL parameter-based navigation

### Wishlist
- LocalStorage for guest users
- Database persistence for logged-in users
- Automatic sync on login
- Toggle functionality with instant feedback

### Analytics
- MongoDB aggregation for real-time stats
- Revenue calculation from completed orders
- Time-based order trends (last 7 days)
- Recent orders display

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (Admin/User)
- Protected API routes
- Environment variable configuration
- CSRF protection via NextAuth

## 🎨 UI/UX Highlights

- Mobile-first responsive design
- Modern gradient backgrounds
- Smooth transitions and animations
- Loading states and error handling
- Toast notifications for user feedback
- Optimized images with Next.js Image
- Accessible UI components from Radix UI

## 📧 Email Templates

Professional email templates included for:
- Order confirmation (customer)
- New order notification (admin)
- Order details with items, pricing, and delivery address
- Branded design with gradient headers

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Update these for production:
- `NEXTAUTH_URL` - Your domain
- `MONGODB_URI` - Production MongoDB connection
- `MINIO_ENDPOINT` - Production MinIO endpoint
- `MINIO_USE_SSL` - Set to `true`
- Email credentials

## 🧪 Testing the Application

1. **Create Admin User** (see Admin Access section)
2. **Add Products:**
   - Log in as admin
   - Go to `/admin/products`
   - Click "Add Product"
   - Upload images, set details, save
3. **Test Customer Flow:**
   - Browse products at `/products`
   - Use search and filters
   - Add items to cart
   - Add items to wishlist
   - Complete checkout
4. **Test Admin Features:**
   - View dashboard analytics
   - Manage orders
   - Update order status

## 📝 API Documentation

### Products
- `GET /api/products` - List products (supports filtering, search, pagination)
- `GET /api/products/[id]` - Get single product
- `GET /api/products/slug/[slug]` - Get product by slug
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - List orders (user's own or all for admin)
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status (admin)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist` - Remove from wishlist
- `POST /api/wishlist/sync` - Sync localStorage with database

### Analytics
- `GET /api/analytics` - Get dashboard stats (admin)

## 🤝 Contributing

This is a production-ready template. Feel free to customize:
- Add more payment methods
- Implement product reviews
- Add discount codes
- Create customer profiles
- Implement advanced analytics

## 📄 License

This project is provided as-is for educational and commercial use.

## 🆘 Support

For issues or questions:
1. Check environment variables are set correctly
2. Verify MongoDB and MinIO are running
3. Check browser console for errors
4. Review API responses in Network tab

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
#   a v a n y a a - s t o r e  
 