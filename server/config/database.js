// config/database.js - ĐÃ FIX WARNINGS
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Đã xóa useNewUrlParser và useUnifiedTopology (deprecated)
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-supermarket'
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Xử lý các event của connection
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;