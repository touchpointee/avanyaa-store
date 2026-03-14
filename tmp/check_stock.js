const mongoose = require('mongoose');

async function checkStock() {
  try {
    const conn = await mongoose.connect('mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true');
    console.log('Connected to DB');
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    const allProducts = await Product.find({}, 'name stock variants').lean();
    console.log(`TOTAL_PRODUCTS: ${allProducts.length}`);
    
    allProducts.forEach(p => {
        console.log(`PRODUCT_ENTRY: ${p.name} | STOCK: ${p.stock}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
