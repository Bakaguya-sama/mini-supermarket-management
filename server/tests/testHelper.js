const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Account, Customer, Staff, Product, Cart, CartItem, Order } = require('../models');

const TEST_DB = 'mongodb://127.0.0.1:27017/mini-supermarket-test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

async function setupDB() {
  console.log('--- Setting up Test DB ---');
  // Force override env vars before anything else loads
  process.env.MONGODB_URI = TEST_DB;
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';

  if (mongoose.connection.readyState === 0) {
    try {
      console.log(`Connecting to ${TEST_DB}...`);
      await mongoose.connect(TEST_DB, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to Test DB');
    } catch (err) {
      console.error('❌ Failed to connect to Test DB:', err.message);
      throw err;
    }
  }
}

async function teardownDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.db.dropDatabase();
      await mongoose.disconnect();
    }
  } catch (e) {
    // ignore teardown errors
  }
}

async function clearCollections() {
  const cols = [Account, Customer, Staff, Product, Cart, CartItem, Order];
  await Promise.all(cols.map(m => m.deleteMany({})));
}

function getApp() {
  // Re-require every time so the app picks up the correct MONGODB_URI
  return require('../server');
}

async function createAccount(role = 'customer', extras = {}) {
  const suffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  return Account.create(Object.assign({
    username: `user_${suffix}`,
    email: `test_${suffix}@example.com`,
    role,
    full_name: 'Test User'
  }, extras));
}

function makeTokenForAccount(account) {
  return jwt.sign({ id: account._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
}

module.exports = {
  setupDB,
  teardownDB,
  clearCollections,
  getApp,
  createAccount,
  makeTokenForAccount,
  models: { Account, Customer, Staff, Product, Cart, CartItem, Order }
};
