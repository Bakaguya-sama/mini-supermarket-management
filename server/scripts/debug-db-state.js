// Debug script to check database state
const mongoose = require('mongoose');
const path = require('path');

// Require models from correct path
const modelsPath = path.join(__dirname, '..', 'models');
const { Product, Shelf, ProductShelf } = require(modelsPath);

async function checkDatabaseState() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket';
    console.log('Connecting to:', mongoURI);
    await mongoose.connect(mongoURI);

    console.log('\u2705 Connected to database\\n');

    // Check products with stock
    console.log('=== PRODUCTS WITH STOCK ===');
    const products = await Product.find({ 
      isDelete: false,
      current_stock: { $gt: 0 }
    }).limit(10);
    
    console.log(`Found ${products.length} products with stock\\n`);
    products.forEach(p => {
      console.log(`${p.name}:`);
      console.log(`  - ID: ${p._id}`);
      console.log(`  - current_stock: ${p.current_stock}`);
      console.log(`  - category: ${p.category}`);
      console.log('');
    });

    // Check shelves with available space
    console.log('\\n=== SHELVES WITH AVAILABLE SPACE ===');
    const shelves = await Shelf.find({ isDelete: false }).limit(10);
    
    console.log(`Found ${shelves.length} shelves\\n`);
    shelves.forEach(s => {
      const available = s.capacity - (s.current_quantity || 0);
      console.log(`${s.shelf_number}:`);
      console.log(`  - ID: ${s._id}`);
      console.log(`  - capacity: ${s.capacity}`);
      console.log(`  - current_quantity: ${s.current_quantity || 0}`);
      console.log(`  - available: ${available}`);
      console.log('');
    });

    // Check product-shelf mappings
    console.log('\\n=== EXISTING PRODUCT-SHELF MAPPINGS ===');
    const mappings = await ProductShelf.find({ isDelete: false })
      .populate('product_id', 'name current_stock')
      .populate('shelf_id', 'shelf_number')
      .limit(10);
      
    console.log(`Found ${mappings.length} mappings\\n`);
    mappings.forEach(m => {
      console.log(`Mapping ${m._id}:`);
      console.log(`  - Product: ${m.product_id?.name || 'Unknown'} (stock: ${m.product_id?.current_stock || 0})`);
      console.log(`  - Shelf: ${m.shelf_id?.shelf_number || 'Unknown'}`);
      console.log(`  - Quantity: ${m.quantity}`);
      console.log('');
    });

    mongoose.connection.close();
    console.log('\\n\u2705 Database check complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabaseState();
