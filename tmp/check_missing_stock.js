const mongoose = require('mongoose');

async function checkMissingStock() {
  try {
    const uri = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';
    await mongoose.connect(uri);
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Simulating the dashboard query
    const productsFromQuery = await Product.find({
      $or: [
        { stock: { $lte: 5 } },
        { stock: { $exists: false } },
        { stock: null },
        { variants: { $elemMatch: { stock: { $lte: 5 } } } }
      ]
    }).lean();
    
    console.log(`Products matching query: ${productsFromQuery.length}`);
    
    const allProducts = await Product.find({}).lean();
    
    // Manual check:
    const expectedOutOfStock = [];
    allProducts.forEach(p => {
        if (p.variants && p.variants.length > 0) {
            p.variants.forEach(v => {
                if ((v.stock || 0) <= 0) {
                    expectedOutOfStock.push(`${p.name} - Variant: ${v.size}/${v.color}`);
                }
            });
        } else {
            if ((p.stock || 0) <= 0) {
                expectedOutOfStock.push(`${p.name} - Main Product`);
            }
        }
    });
    
    console.log(`Expected Out Of Stock (total: ${expectedOutOfStock.length}):`);
    expectedOutOfStock.forEach(item => console.log(item));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMissingStock();
