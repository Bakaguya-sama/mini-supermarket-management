const mongoose = require('mongoose');
const connectDB = require('../config/database');
const app = require('../server');
const jwt = require('jsonwebtoken');
const { Account, Customer, Staff, Product, Cart, CartItem, Order } = require('../models');

const TEST_DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-supermarket-test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

async function setupDB() {
  process.env.MONGODB_URI = TEST_DB;
  process.env.JWT_SECRET = JWT_SECRET;
  await connectDB();
}

async function teardownDB() {
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (e) {
    // ignore
  }
  await mongoose.disconnect();
}

async function clearCollections() {
  const models = [Account, Customer, Staff, Product, Cart, CartItem, Order];
  await Promise.all(models.map(m => m.deleteMany({}))); 
}

function getApp() { return app; }

async function createAccount(role = 'customer', extras = {}) {
  const acc = await Account.create(Object.assign({
    username: `user_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
    email: `test_${Date.now()}_${Math.random().toString(36,2)}@example.com`,
    role,
    full_name: 'Test User'
  }, extras));
  return acc;
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
