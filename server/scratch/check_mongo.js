const mongoose = require('mongoose');

async function check() {
  try {
    console.log('Connecting to mongodb://127.0.0.1:27017/mini-supermarket...');
    await mongoose.connect('mongodb://127.0.0.1:27017/mini-supermarket', { serverSelectionTimeoutMS: 2000 });
    console.log('Connected!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to connect:', err.message);
  }
}

check();
