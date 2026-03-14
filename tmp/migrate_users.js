const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function migrateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI not found in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const UserSchema = new mongoose.Schema({
        status: { type: String, default: 'active' }
    }, { strict: false });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const result = await User.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'active' } }
    );

    console.log(`Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

migrateUsers();
