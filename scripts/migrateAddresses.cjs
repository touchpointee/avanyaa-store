const { MongoClient, ObjectId } = require('mongodb');

const URI =
    'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';

async function run() {
    const client = new MongoClient(URI);
    await client.connect();
    const db = client.db();

    const users = await db.collection('users').find({}).toArray();
    let migrated = 0;

    for (const user of users) {
        if (Array.isArray(user.addresses) && user.addresses.length > 0) {
            console.log('Skip (already has):', user.email);
            continue;
        }

        // userId in orders collection is stored as ObjectId
        const order = await db.collection('orders').findOne(
            { userId: user._id },
            { sort: { createdAt: -1 }, projection: { address: 1 } }
        );

        if (!order || !order.address) {
            console.log('No order for:', user.email);
            continue;
        }

        const a = order.address;
        // country was not stored in old orders — default to India
        const push = {
            _id: new ObjectId(),
            label: 'Home',
            fullName: a.fullName || '',
            phone: a.phone || '',
            email: a.email || user.email || '',
            street: a.street || '',
            city: a.city || '',
            state: a.state || '',
            zipCode: a.zipCode || '',
            country: a.country || 'India',
            isDefault: true,
        };

        // Only migrate if we have the minimum required fields
        if (!push.fullName || !push.street || !push.city || !push.state || !push.zipCode) {
            console.log('Still incomplete - skipping:', user.email, push);
            continue;
        }

        await db.collection('users').updateOne(
            { _id: user._id },
            { $push: { addresses: push } }
        );

        console.log('Migrated:', user.email, '->', push.city, push.state);
        migrated++;
    }

    console.log('\nDone. Migrated', migrated, 'user(s).');
    await client.close();
}

run().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
