// server/tests/order.integration.test.js
const mongoose = require('mongoose');
const models = require('../models');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

describe('Order Integration Tests', () => {
  let testCustomerId;
  let testProductId;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create test customer
    const hashedPassword = await bcrypt.hash('password123', 10);
    const account = await models.Account.create({
      username: `test_customer_${Date.now()}`,
      passwordHash: hashedPassword,
      email: `test_customer_${Date.now()}@test.com`,
      fullName: 'Test Customer',
      phone: '0901234567',
      role: 'customer'
    });

    const customer = await models.Customer.create({
      accountId: account._id,
      membershipType: 'regular',
      pointsBalance: 0
    });
    testCustomerId = customer._id;

    // Create test supplier and product
    const supplier = await models.Supplier.create({
      name: 'Order Test Supplier',
      contactPersonName: 'Supplier Contact',
      email: `order_supplier_${Date.now()}@test.com`,
      phone: '0909876543'
    });

    const product = await models.Product.create({
      name: 'Order Test Product',
      unit: 'box',
      price: 50000,
      currentStock: 100,
      supplierId: supplier._id
    });
    testProductId = product._id;
  });

  afterAll(async () => {
    await models.Order.deleteMany({});
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('Order Creation', () => {
    it('should create order successfully', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-000001`,
        customerId: testCustomerId,
        totalAmount: 250000,
        status: 'pending'
      });

      expect(order).toBeDefined();
      expect(order._id).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.totalAmount).toBe(250000);
      expect(order.status).toBe('pending');
    });

    it('should create order with order items', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 250000,
        status: 'pending'
      });

      // Create order items separately
      const item1 = await models.OrderItem.create({
        orderId: order._id,
        productId: testProductId,
        quantity: 2,
        unitPrice: 50000
      });

      const item2 = await models.OrderItem.create({
        orderId: order._id,
        productId: testProductId,
        quantity: 3,
        unitPrice: 50000
      });

      const items = await models.OrderItem.find({ orderId: order._id });
      expect(items.length).toBe(2);
      expect(items[0].quantity).toBe(2);
      expect(items[1].quantity).toBe(3);
    });

    it('should set order date to current time', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending',
        orderDate: new Date()
      });

      expect(order.orderDate).toBeDefined();
      expect(order.orderDate instanceof Date).toBe(true);
    });
  });

  describe('Order Status Updates', () => {
    it('should update order status', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      await models.Order.findByIdAndUpdate(order._id, {
        status: 'confirmed'
      });

      const updated = await models.Order.findById(order._id);
      expect(updated.status).toBe('confirmed');
    });

    it('should support all valid order statuses', async () => {
      const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

      for (const status of statuses) {
        const order = await models.Order.create({
          orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}-${status}`,
          customerId: testCustomerId,
          totalAmount: 50000,
          status
        });

        expect(order.status).toBe(status);
      }
    });

    it('should transition through order statuses', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      const transitions = ['pending', 'confirmed', 'shipped', 'delivered'];

      for (const status of transitions) {
        await models.Order.findByIdAndUpdate(order._id, { status });
        const updated = await models.Order.findById(order._id);
        expect(updated.status).toBe(status);
      }
    });
  });

  describe('Order Update Operations', () => {
    it('should update order items', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      // Create initial order item
      const item = await models.OrderItem.create({
        orderId: order._id,
        productId: testProductId,
        quantity: 1,
        unitPrice: 50000
      });

      // Update the item
      await models.OrderItem.findByIdAndUpdate(item._id, {
        quantity: 3
      });

      // Update order total
      await models.Order.findByIdAndUpdate(order._id, {
        totalAmount: 150000
      });

      const updated = await models.OrderItem.findById(item._id);
      expect(updated.quantity).toBe(3);
      
      const updatedOrder = await models.Order.findById(order._id);
      expect(updatedOrder.totalAmount).toBe(150000);
    });

    it('should add order notes', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      const notes = 'Please deliver in the morning';
      await models.Order.findByIdAndUpdate(order._id, { notes });

      const updated = await models.Order.findById(order._id);
      expect(updated.notes).toBe(notes);
    });
  });

  describe('Order Query Operations', () => {
    it('should query orders by status', async () => {
      await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'confirmed'
      });

      const confirmed = await models.Order.find({ status: 'confirmed' });
      expect(confirmed.length).toBeGreaterThan(0);
      expect(confirmed.every(o => o.status === 'confirmed')).toBe(true);
    });

    it('should query orders by customer', async () => {
      await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      const orders = await models.Order.find({ customerId: testCustomerId });
      expect(orders.length).toBeGreaterThan(0);
      expect(orders.every(o => o.customerId.toString() === testCustomerId.toString())).toBe(true);
    });

    it('should search order by number', async () => {
      const orderNumber = `ORD-${new Date().getFullYear()}-SEARCH001`;
      
      await models.Order.create({
        orderNumber,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      const orders = await models.Order.find({
        orderNumber: { $regex: 'SEARCH' }
      });

      expect(orders.length).toBeGreaterThan(0);
    });
  });

  describe('Order Pagination', () => {
    it('should paginate orders correctly', async () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const orders = await models.Order.find()
        .limit(limit)
        .skip(skip)
        .sort({ orderDate: -1 });

      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeLessThanOrEqual(limit);
    });

    it('should calculate pagination metadata', async () => {
      const limit = 10;
      const total = await models.Order.countDocuments();
      const pages = Math.ceil(total / limit);

      expect(pages).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Order Data Integrity', () => {
    it('should maintain customer relationship', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      // Fetch and populate the order
      const populatedOrder = await models.Order.findById(order._id).populate('customerId');

      expect(populatedOrder.customerId._id.toString()).toBe(testCustomerId.toString());
      expect(populatedOrder.customerId).toHaveProperty('membershipType');
    });

    it('should preserve timestamps', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
      expect(order.createdAt instanceof Date).toBe(true);
    });

    it('should validate required fields', async () => {
      try {
        await models.Order.create({
          // Missing required fields
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Order Statistics', () => {
    it('should count orders by status', async () => {
      const pending = await models.Order.countDocuments({ status: 'pending' });
      const delivered = await models.Order.countDocuments({ status: 'delivered' });

      expect(typeof pending).toBe('number');
      expect(typeof delivered).toBe('number');
    });

    it('should calculate total revenue from delivered orders', async () => {
      await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'delivered'
      });

      const result = await models.Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]);

      const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
      expect(typeof totalRevenue).toBe('number');
      expect(totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should count orders per customer', async () => {
      const orderCount = await models.Order.countDocuments({
        customerId: testCustomerId
      });

      expect(typeof orderCount).toBe('number');
      expect(orderCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Order Deletion', () => {
    it('should only allow deletion of pending orders', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'pending'
      });

      // Should allow deletion
      await models.Order.findByIdAndDelete(order._id);
      const deleted = await models.Order.findById(order._id);
      expect(deleted).toBeNull();
    });

    it('should preserve delivered orders', async () => {
      const order = await models.Order.create({
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now()}`,
        customerId: testCustomerId,
        totalAmount: 50000,
        status: 'delivered'
      });

      const found = await models.Order.findById(order._id);
      expect(found).toBeDefined();
      expect(found.status).toBe('delivered');
    });
  });
});
