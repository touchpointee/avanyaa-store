const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://root:gxzDIONJGHAzX5zZ7q5UZKsevVkUfCcMgZNVJfZuZ65EYYHsXJPXUJXt1EqHsbV8@72.60.219.81:27019/?directConnection=true');
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const query = {
    $or: [
      { stock: { $lte: 5 } },
      { stock: { $exists: false } },
      { stock: null },
      { variants: { $elemMatch: { stock: { $lte: 5 } } } }
    ]
  };

  const docs = await Product.find(query).lean();
  console.log(`Matched Query:`);
  docs.forEach(d => console.log(d.name));
  
  process.exit(0);
}
check();
