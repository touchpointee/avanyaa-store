const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true');
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const query = {
    $or: [
      { stock: { $lte: 0 } },
      { stock: { $exists: false } },
      { stock: null },
      { variants: { $elemMatch: { stock: { $lte: 0 } } } }
    ]
  };

  const docs = await Product.find(query).lean();
  console.log(`Found ${docs.length} products matching Out of Stock query`);
  docs.forEach(d => {
    console.log(`PRODUCT: ${d.name} | TotalStock: ${d.stock}`);
    if (d.variants) {
      d.variants.forEach(v => {
        if ((v.stock || 0) <= 0) {
          console.log(`  -> Variant Out of stock: ${v.size}/${v.color}`);
        }
      });
    }
  });
  
  process.exit(0);
}

check();
