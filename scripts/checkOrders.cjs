const { MongoClient } = require('mongodb');
const URI = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';

async function run() {
    const client = new MongoClient(URI);
    await client.connect();
    const db = client.db();

    // Show all orders with their full address field
    const orders = await db.collection('orders').find({}, { projection: { userId: 1, address: 1, createdAt: 1 } }).toArray();
    console.log('Total orders:', orders.length);
    orders.forEach((o, i) => {
        console.log(`\nOrder ${i + 1}:`);
        console.log('  userId:', o.userId?.toString());
        console.log('  address keys:', o.address ? Object.keys(o.address) : 'NO ADDRESS');
        console.log('  address:', JSON.stringify(o.address, null, 4));
    });

    await client.close();
}
run().catch(console.error);
