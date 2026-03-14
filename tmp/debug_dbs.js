const mongoose = require('mongoose');

async function debugDBs() {
  const uriBase = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/';
  const dbs = ['test', 'default'];
  
  for (const dbName of dbs) {
    console.log(`--- DB: ${dbName} ---`);
    const conn = await mongoose.createConnection(`${uriBase}${dbName}?directConnection=true`).asPromise();
    const collections = await conn.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    if (collections.some(c => c.name === 'products')) {
        const count = await conn.db.collection('products').countDocuments();
        console.log(`- Products Count: ${count}`);
    }
    await conn.close();
  }
  process.exit(0);
}

debugDBs();
