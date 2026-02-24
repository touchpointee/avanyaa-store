/**
 * One-time migration: copies the delivery address from each user's
 * most-recent order into their User.addresses array.
 *
 * Run with:  node scripts/migrateAddresses.mjs
 */

import { MongoClient, ObjectId } from 'mongodb';

const URI = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';

const client = new MongoClient(URI);
await client.connect();
const db = client.db();

const users = await db.collection('users').find({}).toArray();
let migrated = 0;

for (const user of users) {
    // Skip if already has addresses
    if (Array.isArray(user.addresses) && user.addresses.length > 0) continue;

    // Find most-recent order for this user
    const order = await db.collection('orders')
        .findOne(
            { userId: user._id.toString() },
            { sort: { createdAt: -1 }, projection: { address: 1 } }
        );

    if (!order?.address) continue;

    const addr = order.address;
    if (!addr.fullName || !addr.phone || !addr.street || !addr.city || !addr.state || !addr.zipCode || !addr.country) continue;

    await db.collection('users').updateOne(
        { _id: user._id },
        {
            $push: {
                addresses: {
                    _id: new ObjectId(),
                    label: 'Home',
                    fullName: addr.fullName ?? '',
                    phone: addr.phone ?? '',
                    email: addr.email ?? user.email ?? '',
                    street: addr.street ?? '',
                    city: addr.city ?? '',
                    state: addr.state ?? '',
                    zipCode: addr.zipCode ?? '',
                    country: addr.country ?? 'India',
                    isDefault: true,
                },
            },
        }
    );
    console.log(`✅ Migrated address for: ${user.email}`);
    migrated++;
}

console.log(`\nDone. Migrated ${migrated} user(s).`);
await client.close();
