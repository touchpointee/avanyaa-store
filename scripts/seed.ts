/**
 * Database Seed Script
 *
 * Run: npm run seed
 * Creates admin user (use .env ADMIN_EMAIL / ADMIN_PASSWORD or defaults below).
 */
import * as path from 'path';
// Load .env so MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD are available
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} catch {
  // dotenv optional
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avanyaa-fashion';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@avanyaa.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  compareAtPrice: Number,
  category: String,
  sizes: [String],
  colors: [String],
  images: [String],
  stock: Number,
  featured: Boolean,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const sampleUsers = [
  {
    name: 'Admin User',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  },
  {
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'user',
  },
];

const sampleProducts = [
  {
    name: 'Elegant Evening Gown',
    slug: 'elegant-evening-gown',
    description: 'A stunning floor-length evening gown perfect for special occasions. Features a fitted bodice and flowing skirt.',
    price: 4999,
    compareAtPrice: 6999,
    category: 'formal',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Red', 'Blue'],
    images: ['https://via.placeholder.com/600x800/000000/FFFFFF?text=Evening+Gown'],
    stock: 15,
    featured: true,
  },
  {
    name: 'Casual Summer Dress',
    slug: 'casual-summer-dress',
    description: 'Light and breezy summer dress perfect for warm weather. Made from breathable cotton fabric.',
    price: 1999,
    compareAtPrice: 2999,
    category: 'summer',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Yellow', 'Pink'],
    images: ['https://via.placeholder.com/600x800/FFFF00/000000?text=Summer+Dress'],
    stock: 25,
    featured: true,
  },
  {
    name: 'Party Cocktail Dress',
    slug: 'party-cocktail-dress',
    description: 'Glamorous cocktail dress perfect for parties and celebrations. Features sequin details and a flattering fit.',
    price: 3499,
    compareAtPrice: 4999,
    category: 'party',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Red', 'Purple'],
    images: ['https://via.placeholder.com/600x800/FF00FF/FFFFFF?text=Cocktail+Dress'],
    stock: 10,
    featured: true,
  },
  {
    name: 'Traditional Ethnic Dress',
    slug: 'traditional-ethnic-dress',
    description: 'Beautiful ethnic dress with traditional embroidery. Perfect for cultural events and celebrations.',
    price: 2999,
    category: 'ethnic',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Red', 'Green', 'Blue'],
    images: ['https://via.placeholder.com/600x800/008000/FFFFFF?text=Ethnic+Dress'],
    stock: 20,
    featured: false,
  },
  {
    name: 'Winter Wool Dress',
    slug: 'winter-wool-dress',
    description: 'Warm and stylish wool dress perfect for winter. Features long sleeves and midi length.',
    price: 3999,
    category: 'winter',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Blue', 'Purple'],
    images: ['https://via.placeholder.com/600x800/0000FF/FFFFFF?text=Winter+Dress'],
    stock: 18,
    featured: false,
  },
  {
    name: 'Business Formal Dress',
    slug: 'business-formal-dress',
    description: 'Professional formal dress perfect for business meetings and corporate events. Clean lines and elegant design.',
    price: 3999,
    category: 'formal',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Blue'],
    images: ['https://via.placeholder.com/600x800/000000/FFFFFF?text=Business+Dress'],
    stock: 22,
    featured: true,
  },
  {
    name: 'Casual Day Dress',
    slug: 'casual-day-dress',
    description: 'Comfortable everyday dress perfect for casual outings. Easy to wear and style.',
    price: 1499,
    compareAtPrice: 1999,
    category: 'casual',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Blue', 'Pink'],
    images: ['https://via.placeholder.com/600x800/FFFFFF/000000?text=Day+Dress'],
    stock: 30,
    featured: false,
  },
  {
    name: 'Floral Print Dress',
    slug: 'floral-print-dress',
    description: 'Beautiful floral print dress perfect for spring and summer. Feminine and stylish.',
    price: 2499,
    category: 'summer',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pink', 'Yellow', 'White'],
    images: ['https://via.placeholder.com/600x800/FFC0CB/000000?text=Floral+Dress'],
    stock: 28,
    featured: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`   ✓ Created user: ${userData.email} (password: ${userData.password})`);
    }

    // Create products
    console.log('📦 Creating products...');
    for (const productData of sampleProducts) {
      await Product.create(productData);
      console.log(`   ✓ Created product: ${productData.name}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('   Customer: customer@example.com / customer123');
    console.log('\n🚀 Sign in at /auth/signin then go to /admin');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seed();
