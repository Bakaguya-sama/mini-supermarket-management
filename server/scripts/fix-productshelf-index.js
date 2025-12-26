// Script to fix duplicate key error by dropping old index
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket';
    console.log('Connecting to:', mongoURI);
    await mongoose.connect(mongoURI);

    console.log('✅ Connected to database\n');

    // Get ProductShelf collection
    const db = mongoose.connection.db;
    const collection = db.collection('productshelves');

    // List all indexes
    console.log('=== CURRENT INDEXES ===');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('Index:', JSON.stringify(index, null, 2));
    });

    // Drop the problematic index (product_id_1 unique)
    console.log('\n=== DROPPING OLD INDEX ===');
    try {
      await collection.dropIndex('product_id_1');
      console.log('✅ Dropped index: product_id_1');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️ Index product_id_1 does not exist (already dropped or never existed)');
      } else {
        throw error;
      }
    }

    // Verify remaining indexes
    console.log('\n=== INDEXES AFTER CLEANUP ===');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('Index:', JSON.stringify(index, null, 2));
    });

    console.log('\n✅ Index cleanup complete!');
    console.log('ℹ️ The correct composite index (product_id + shelf_id) should remain.');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();
