const mongoose = require('mongoose');

async function checkStock() {
  try {
    const uri = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';
    await mongoose.connect(uri);
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}));
    
    const products = await Product.collection.find({}).project({ name: 1, stock: 1, variants: 1 }).toArray();
    
    console.log(`FOUND_${products.length}_PRODUCTS`);
    products.forEach((p, i) => {
      const variantStock = p.variants ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 'N/A';
      console.log(`${i+1}. NAME: ${p.name} | STOCK: ${p.stock} | VARIANT_SUM: ${variantStock}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
