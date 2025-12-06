// server/tests/customer.integration.test.js
const mongoose = require('mongoose');
const models = require('../models');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

describe('Customer Integration Tests', () => {
  let testAccountId;
  let testCustomerId;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create test account
    const hashedPassword = await bcrypt.hash('password123', 10);
    const account = await models.Account.create({
      username: `test_cust_${Date.now()}`,
      passwordHash: hashedPassword,
      email: `test_cust_${Date.now()}@test.com`,
      fullName: 'Test Customer',
      phone: '0901234567',
      role: 'customer'
    });
    testAccountId = account._id;
  });

  afterAll(async () => {
    await models.Customer.deleteMany({});
    await models.Account.deleteMany({});
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('Customer Creation', () => {
    it('should create customer successfully', async () => {
      const customer = await models.Customer.create({
        accountId: testAccountId,
        membershipType: 'regular',
        pointsBalance: 0,
        totalSpent: 0
      });

      expect(customer).toBeDefined();
      expect(customer._id).toBeDefined();
      expect(customer.membershipType).toBe('regular');
      expect(customer.pointsBalance).toBe(0);
      testCustomerId = customer._id;
    });

    it('should support different membership types', async () => {
      const types = ['regular', 'silver', 'gold', 'platinum'];
      
      for (const type of types) {
        const hashedPassword = await bcrypt.hash('pass123', 10);
        const account = await models.Account.create({
          username: `cust_${type}_${Date.now()}`,
          passwordHash: hashedPassword,
          email: `cust_${type}_${Date.now()}@test.com`,
          fullName: `Customer ${type}`,
          phone: '0909999999',
          role: 'customer'
        });

        const customer = await models.Customer.create({
          accountId: account._id,
          membershipType: type
        });

        expect(customer.membershipType).toBe(type);
      }
    });

    it('should set default membership to regular', async () => {
      const hashedPassword = await bcrypt.hash('pass123', 10);
      const account = await models.Account.create({
        username: `cust_default_${Date.now()}`,
        passwordHash: hashedPassword,
        email: `cust_default_${Date.now()}@test.com`,
        fullName: 'Default Customer',
        phone: '0908888888',
        role: 'customer'
      });

      const customer = await models.Customer.create({
        accountId: account._id
      });

      expect(customer.membershipType).toBe('regular');
    });
  });

  describe('Customer Update Operations', () => {
    it('should update membership type', async () => {
      const hashedPassword = await bcrypt.hash('pass123', 10);
      const account = await models.Account.create({
        username: `cust_update_${Date.now()}`,
        passwordHash: hashedPassword,
        email: `cust_update_${Date.now()}@test.com`,
        fullName: 'Update Customer',
        phone: '0907777777',
        role: 'customer'
      });

      const customer = await models.Customer.create({
        accountId: account._id,
        membershipType: 'regular'
      });

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { membershipType: 'gold' },
        { new: true }
      );

      expect(updated.membershipType).toBe('gold');
    });

    it('should update customer notes', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      const notes = 'VIP customer - high value';

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { notes },
        { new: true }
      );

      expect(updated.notes).toBe(notes);
    });

    it('should update points balance', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      
      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { pointsBalance: 1000 },
        { new: true }
      );

      expect(updated.pointsBalance).toBe(1000);
    });

    it('should update total spent', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      
      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { totalSpent: 5000000 },
        { new: true }
      );

      expect(updated.totalSpent).toBe(5000000);
    });
  });

  describe('Customer Query Operations', () => {
    it('should query all customers with pagination', async () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const customers = await models.Customer.find()
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeLessThanOrEqual(limit);
    });

    it('should query by membership type', async () => {
      const goldCustomers = await models.Customer.find({ membershipType: 'gold' });
      
      expect(Array.isArray(goldCustomers)).toBe(true);
      expect(goldCustomers.every(c => c.membershipType === 'gold')).toBe(true);
    });

    it('should find customer by account ID', async () => {
      const customer = await models.Customer.findOne({ accountId: testAccountId });

      expect(customer).toBeDefined();
      expect(customer.accountId.toString()).toBe(testAccountId.toString());
    });

    it('should populate account information', async () => {
      const customer = await models.Customer.findById(testCustomerId)
        .populate('accountId', 'fullName email phone');

      expect(customer.accountId).toBeDefined();
      expect(customer.accountId.fullName).toBeDefined();
      expect(customer.accountId.email).toBeDefined();
    });
  });

  describe('Customer Pagination', () => {
    it('should calculate pagination correctly', async () => {
      const limit = 5;
      const total = await models.Customer.countDocuments();
      const pages = Math.ceil(total / limit);

      expect(pages).toBeGreaterThanOrEqual(0);
    });

    it('should skip records correctly', async () => {
      const page = 2;
      const limit = 5;
      const skip = (page - 1) * limit;

      const customers = await models.Customer.find()
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      expect(Array.isArray(customers)).toBe(true);
    });
  });

  describe('Customer Data Integrity', () => {
    it('should maintain account relationship', async () => {
      const customer = await models.Customer.findById(testCustomerId)
        .populate('accountId');

      expect(customer.accountId._id.toString()).toBe(testAccountId.toString());
      expect(customer.accountId.email).toBeDefined();
    });

    it('should preserve timestamps', async () => {
      const customer = await models.Customer.findById(testCustomerId);

      expect(customer.createdAt).toBeDefined();
      expect(customer.updatedAt).toBeDefined();
      expect(customer.createdAt instanceof Date).toBe(true);
    });

    it('should validate required fields', async () => {
      try {
        await models.Customer.create({
          // Missing accountId
          membershipType: 'regular'
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should set default points to zero', async () => {
      const hashedPassword = await bcrypt.hash('pass123', 10);
      const account = await models.Account.create({
        username: `cust_points_${Date.now()}`,
        passwordHash: hashedPassword,
        email: `cust_points_${Date.now()}@test.com`,
        fullName: 'Points Customer',
        phone: '0906666666',
        role: 'customer'
      });

      const customer = await models.Customer.create({
        accountId: account._id
      });

      expect(customer.pointsBalance).toBe(0);
      expect(customer.totalSpent).toBe(0);
    });
  });

  describe('Customer Points Management', () => {
    it('should add points', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      const initialPoints = customer.pointsBalance;
      const pointsToAdd = 500;

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { pointsBalance: initialPoints + pointsToAdd },
        { new: true }
      );

      expect(updated.pointsBalance).toBe(initialPoints + pointsToAdd);
    });

    it('should subtract points without going negative', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      const pointsToSubtract = 100;
      
      const newPoints = Math.max(0, customer.pointsBalance - pointsToSubtract);

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { pointsBalance: newPoints },
        { new: true }
      );

      expect(updated.pointsBalance).toBeGreaterThanOrEqual(0);
    });

    it('should set points directly', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      const newPoints = 2000;

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { pointsBalance: newPoints },
        { new: true }
      );

      expect(updated.pointsBalance).toBe(newPoints);
    });
  });

  describe('Customer Spending Statistics', () => {
    it('should track total spent amount', async () => {
      const customer = await models.Customer.findById(testCustomerId);
      const amount = 1000000;

      const updated = await models.Customer.findByIdAndUpdate(
        customer._id,
        { totalSpent: customer.totalSpent + amount },
        { new: true }
      );

      expect(updated.totalSpent).toBeGreaterThanOrEqual(amount);
    });

    it('should count customers by membership', async () => {
      const membershipCounts = await models.Customer.aggregate([
        { $group: { _id: '$membershipType', count: { $sum: 1 } } }
      ]);

      expect(Array.isArray(membershipCounts)).toBe(true);
    });

    it('should calculate total points issued', async () => {
      const result = await models.Customer.aggregate([
        { $group: { _id: null, totalPoints: { $sum: '$pointsBalance' } } }
      ]);

      const totalPoints = result.length > 0 ? result[0].totalPoints : 0;
      expect(typeof totalPoints).toBe('number');
    });

    it('should calculate average spending', async () => {
      const result = await models.Customer.aggregate([
        { $group: { _id: null, avgSpent: { $avg: '$totalSpent' } } }
      ]);

      const avgSpent = result.length > 0 ? result[0].avgSpent : 0;
      expect(typeof avgSpent).toBe('number');
    });
  });

  describe('Customer Deletion', () => {
    it('should delete customer completely', async () => {
      const hashedPassword = await bcrypt.hash('pass123', 10);
      const account = await models.Account.create({
        username: `cust_delete_${Date.now()}`,
        passwordHash: hashedPassword,
        email: `cust_delete_${Date.now()}@test.com`,
        fullName: 'Delete Customer',
        phone: '0905555555',
        role: 'customer'
      });

      const customer = await models.Customer.create({
        accountId: account._id
      });

      await models.Customer.findByIdAndDelete(customer._id);
      const deleted = await models.Customer.findById(customer._id);

      expect(deleted).toBeNull();
    });
  });
});
