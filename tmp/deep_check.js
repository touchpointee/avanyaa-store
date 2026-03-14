const mongoose = require('mongoose');

async function checkStock() {
  try {
    const uri = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';
    await mongoose.connect(uri);
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}));
    
    const products = await Product.collection.find({}).toArray();
    
    products.forEach(p => {
        console.log(`P: ${p.name} | T_STOCK: ${p.stock}`);
        if (p.variants) {
            p.variants.forEach(v => {
                console.log(`  - V: ${v.size}/${v.color} | S: ${v.stock}`);
            });
        }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
