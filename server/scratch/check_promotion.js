const mongoose = require('mongoose');
const { Promotion } = require('../models');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mini-supermarket-test');
  console.log('Schema paths:', Object.keys(Promotion.schema.paths));
  console.log('Required paths:', Promotion.schema.requiredPaths());
  
  try {
    const p = new Promotion({
      name: 'Test',
      discount_type: 'percentage',
      discount_value: 10,
      start_date: new Date(),
      end_date: new Date()
    });
    await p.validate();
    console.log('✅ Validation passed');
  } catch (err) {
    console.error('❌ Validation failed:', err.message);
  }
  await mongoose.disconnect();
}

check();
