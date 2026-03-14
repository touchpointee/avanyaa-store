const mongoose = require('mongoose');

async function checkStr() {
  await mongoose.connect('mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true');
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const docs = await Product.find({}).lean();
  let cnt = 0;
  docs.forEach(d => {
    if (typeof d.stock === 'string') {
        console.log(`String TotalStock for ${d.name}: "${d.stock}"`);
        cnt++;
    }
    if (d.variants) {
      d.variants.forEach(v => {
        if (typeof v.stock === 'string') {
          console.log(`String VariantStock for ${d.name} (${v.size}/${v.color}): "${v.stock}"`);
          cnt++;
        }
      });
    }
  });
  if (cnt === 0) console.log('No string stocks found.');
  process.exit(0);
}
checkStr();
