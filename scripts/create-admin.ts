/**
 * Create or update admin user only (does not wipe data).
 * Run: npm run create-admin
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env (default: admin@avanyaa.com / admin123).
 */
import * as path from 'path';
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} catch {}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avanyaa-fashion';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@avanyaa.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      existing.password = hashed;
      existing.role = 'admin';
      existing.name = existing.name || 'Admin User';
      await existing.save();
      console.log('✅ Admin updated:', ADMIN_EMAIL);
    } else {
      await User.create({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'admin',
      });
      console.log('✅ Admin created:', ADMIN_EMAIL);
    }
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Sign in at /auth/signin then open /admin');
  } catch (e) {
    console.error('❌ Failed:', e);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
