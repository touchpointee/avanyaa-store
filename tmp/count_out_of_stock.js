const mongoose = require('mongoose');

async function checkStock() {
  try {
    const uri = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';
    await mongoose.connect(uri);
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}));
    
    const outOfStockCount = await Product.collection.countDocuments({ 
        $or: [
          { stock: { $lte: 0 } },
          { stock: { $exists: false } },
          { stock: null }
        ]
    });
    
    console.log(`OUT_OF_STOCK_COUNT: ${outOfStockCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
