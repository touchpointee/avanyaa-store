const mongoose = require('mongoose');
const fs = require('fs');

async function debugAllStock() {
  try {
    const uri = 'mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true';
    await mongoose.connect(uri);
    
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    const products = await Product.find({}).lean();
    
    let output = `--- TOTAL_PRODUCTS_IN_DB: ${products.length} ---\n`;
    
    products.forEach((p, i) => {
      output += `${i+1}. NAME: ${p.name}\n`;
      output += `   TOTAL_STOCK: ${p.stock}\n`;
      if (p.variants && p.variants.length > 0) {
        output += `   VARIANTS:\n`;
        p.variants.forEach(v => {
          output += `     - ${v.size}/${v.color}: ${v.stock}\n`;
        });
      } else {
        output += `   NO_VARIANTS\n`;
      }
      output += '-----------------------------------\n';
    });

    fs.writeFileSync('tmp/inventory_clean_dump.txt', output, 'utf8');
    console.log('Dump written to tmp/inventory_clean_dump.txt');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugAllStock();
