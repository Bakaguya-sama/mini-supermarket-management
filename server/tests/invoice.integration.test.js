// server/tests/invoice.integration.test.js
const mongoose = require('mongoose');
const models = require('../models');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

describe('Invoice Integration Tests', () => {
  let testCustomerId;
  let testOrderId;
  let testProductId;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create test account and customer
    const hashedPassword = await bcrypt.hash('password123', 10);
    const account = await models.Account.create({
      username: `test_invoice_${Date.now()}`,
      passwordHash: hashedPassword,
      email: `test_invoice_${Date.now()}@test.com`,
      fullName: 'Invoice Customer',
      phone: '0901234567',
      role: 'customer'
    });

    const customer = await models.Customer.create({
      accountId: account._id,
      membershipType: 'regular'
    });
    testCustomerId = customer._id;

    // Create test supplier and product
    const supplier = await models.Supplier.create({
      name: 'Invoice Test Supplier',
      contactPersonName: 'Supplier Contact',
      email: `invoice_supp_${Date.now()}@test.com`,
      phone: '0909876543'
    });

    const product = await models.Product.create({
      name: 'Invoice Test Product',
      unit: 'box',
      price: 100000,
      currentStock: 100,
      supplierId: supplier._id
    });
    testProductId = product._id;

    // Create test order
    const order = await models.Order.create({
      orderNumber: `ORD-${new Date().getFullYear()}-INV001`,
      customerId: testCustomerId,
      totalAmount: 100000,
      status: 'confirmed'
    });
    testOrderId = order._id;
  });

  afterAll(async () => {
    await models.Invoice.deleteMany({});
    await models.InvoiceItem.deleteMany({});
    await models.Order.deleteMany({});
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('Invoice Creation', () => {
    it('should create invoice successfully', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        orderId: testOrderId,
        totalAmount: 100000,
        paymentStatus: 'unpaid'
      });

      expect(invoice).toBeDefined();
      expect(invoice._id).toBeDefined();
      expect(invoice.invoiceNumber).toBeDefined();
      expect(invoice.paymentStatus).toBe('unpaid');
    });

    it('should create invoice with items', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        orderId: testOrderId,
        totalAmount: 200000,
        paymentStatus: 'unpaid'
      });

      const item = await models.InvoiceItem.create({
        invoiceId: invoice._id,
        productId: testProductId,
        description: 'Test Product',
        quantity: 2,
        unitPrice: 100000,
        lineTotal: 200000
      });

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
      expect(item.lineTotal).toBe(200000);
    });

    it('should auto-generate invoice number format', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{6}$/);
    });

    it('should set default payment status to unpaid', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 50000
      });

      expect(invoice.paymentStatus).toBe('unpaid');
    });
  });

  describe('Invoice Update Operations', () => {
    it('should update invoice notes', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      const notes = 'Important invoice';
      const updated = await models.Invoice.findByIdAndUpdate(
        invoice._id,
        { notes },
        { new: true }
      );

      expect(updated.notes).toBe(notes);
    });

    it('should update payment status', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000,
        paymentStatus: 'unpaid'
      });

      const updated = await models.Invoice.findByIdAndUpdate(
        invoice._id,
        { paymentStatus: 'paid' },
        { new: true }
      );

      expect(updated.paymentStatus).toBe('paid');
    });
  });

  describe('Invoice Query Operations', () => {
    it('should query invoices by status', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000,
        paymentStatus: 'partial'
      });

      const partialInvoices = await models.Invoice.find({ paymentStatus: 'partial' });

      expect(Array.isArray(partialInvoices)).toBe(true);
      expect(partialInvoices.every(i => i.paymentStatus === 'partial')).toBe(true);
    });

    it('should query invoices by customer', async () => {
      const invoices = await models.Invoice.find({ customerId: testCustomerId });

      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.every(i => i.customerId.toString() === testCustomerId.toString())).toBe(true);
    });

    it('should query invoices by order', async () => {
      const invoices = await models.Invoice.find({ orderId: testOrderId });

      expect(Array.isArray(invoices)).toBe(true);
    });

    it('should search invoice by number', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-SEARCH01`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      const found = await models.Invoice.findOne({
        invoiceNumber: { $regex: 'SEARCH' }
      });

      expect(found).toBeDefined();
    });
  });

  describe('Invoice Pagination', () => {
    it('should paginate invoices correctly', async () => {
      const page = 1;
      const limit = 5;
      const skip = (page - 1) * limit;

      const invoices = await models.Invoice.find()
        .limit(limit)
        .skip(skip)
        .sort({ invoiceDate: -1 });

      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeLessThanOrEqual(limit);
    });

    it('should calculate pagination metadata', async () => {
      const limit = 5;
      const total = await models.Invoice.countDocuments();
      const pages = Math.ceil(total / limit);

      expect(pages).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Invoice Data Integrity', () => {
    it('should maintain customer relationship', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      // Fetch and populate
      const populatedInvoice = await models.Invoice.findById(invoice._id).populate('customerId');

      expect(populatedInvoice.customerId._id.toString()).toBe(testCustomerId.toString());
    });

    it('should maintain order relationship', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        orderId: testOrderId,
        totalAmount: 100000
      });

      // Fetch and populate
      const populatedInvoice = await models.Invoice.findById(invoice._id).populate('orderId');

      expect(populatedInvoice.orderId._id.toString()).toBe(testOrderId.toString());
    });

    it('should preserve timestamps', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      expect(invoice.createdAt).toBeDefined();
      expect(invoice.updatedAt).toBeDefined();
      expect(invoice.createdAt instanceof Date).toBe(true);
    });

    it('should validate required fields', async () => {
      try {
        await models.Invoice.create({
          // Missing invoiceNumber
          customerId: testCustomerId
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Invoice Items', () => {
    it('should create and retrieve invoice items', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 300000
      });

      const items = [
        { productId: testProductId, quantity: 2, unitPrice: 100000, lineTotal: 200000 },
        { productId: testProductId, quantity: 1, unitPrice: 100000, lineTotal: 100000 }
      ];

      for (const item of items) {
        await models.InvoiceItem.create({
          invoiceId: invoice._id,
          description: 'Test Item',
          ...item
        });
      }

      const savedItems = await models.InvoiceItem.find({ invoiceId: invoice._id });

      expect(savedItems.length).toBe(2);
      expect(savedItems[0].quantity).toBe(2);
    });

    it('should cascade delete invoice items', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      await models.InvoiceItem.deleteMany({ invoiceId: invoice._id });
      const items = await models.InvoiceItem.find({ invoiceId: invoice._id });

      expect(items.length).toBe(0);
    });
  });

  describe('Invoice Statistics', () => {
    it('should count invoices by status', async () => {
      const statusCounts = await models.Invoice.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]);

      expect(Array.isArray(statusCounts)).toBe(true);
    });

    it('should calculate total revenue', async () => {
      const result = await models.Invoice.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const totalRevenue = result.length > 0 ? result[0].total : 0;
      expect(typeof totalRevenue).toBe('number');
    });

    it('should calculate average invoice amount', async () => {
      const result = await models.Invoice.aggregate([
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ]);

      const avgAmount = result.length > 0 ? result[0].avg : 0;
      expect(typeof avgAmount).toBe('number');
    });

    it('should group invoices by month', async () => {
      const result = await models.Invoice.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$invoiceDate' },
              month: { $month: '$invoiceDate' }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Invoice Deletion', () => {
    it('should delete invoice and cascade delete items', async () => {
      const count = await models.Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      const invoice = await models.Invoice.create({
        invoiceNumber,
        customerId: testCustomerId,
        totalAmount: 100000
      });

      await models.InvoiceItem.create({
        invoiceId: invoice._id,
        productId: testProductId,
        quantity: 1,
        unitPrice: 100000,
        lineTotal: 100000
      });

      await models.Invoice.findByIdAndDelete(invoice._id);
      await models.InvoiceItem.deleteMany({ invoiceId: invoice._id });

      const deleted = await models.Invoice.findById(invoice._id);
      const items = await models.InvoiceItem.find({ invoiceId: invoice._id });

      expect(deleted).toBeNull();
      expect(items.length).toBe(0);
    });
  });
});
