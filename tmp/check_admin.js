const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function checkAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
        email: String,
        role: String,
        status: String
    }));

    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
        console.log('Admin found:', {
            email: admin.email,
            role: admin.role,
            status: admin.status
        });
    } else {
        console.log('No admin user found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
