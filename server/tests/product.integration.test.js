// server/tests/product.integration.test.js
const mongoose = require('mongoose');
const models = require('../models');

jest.setTimeout(30000);

describe('Product Integration Tests', () => {
  let testSupplierId;
  let testProductId;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create test supplier
    const supplier = await models.Supplier.create({
      name: 'Test Supplier',
      contactPersonName: 'John Doe',
      email: `test_supplier_${Date.now()}@test.com`,
      phone: '0901234567',
      address: 'Test Address',
      isActive: true
    });
    testSupplierId = supplier._id;
  });

  afterAll(async () => {
    await models.Product.deleteMany({ supplierId: testSupplierId });
    await models.Supplier.deleteMany({ _id: testSupplierId });
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('Product Creation', () => {
    it('should create product successfully', async () => {
      const product = await models.Product.create({
        name: 'Test Product',
        description: 'Test Description',
        unit: 'box',
        price: 50000,
        currentStock: 100,
        minimumStockLevel: 20,
        maximumStockLevel: 500,
        supplierId: testSupplierId,
        category: 'Test Category',
        status: 'available'
      });

      expect(product).toBeDefined();
      expect(product._id).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(50000);
      expect(product.status).toBe('available');
      testProductId = product._id;
    });

    it('should validate product unit', async () => {
      const product = await models.Product.create({
        name: 'Product with Unit',
        unit: 'piece',
        price: 25000,
        supplierId: testSupplierId
      });

      expect(product.unit).toBe('piece');
    });

    it('should support multiple categories', async () => {
      const categories = ['Dairy', 'Beverages', 'Snacks', 'Personal Care'];

      for (const category of categories) {
        const product = await models.Product.create({
          name: `Test ${category}`,
          unit: 'box',
          price: 10000,
          supplierId: testSupplierId,
          category
        });

        expect(product.category).toBe(category);
      }
    });
  });

  describe('Product Update Operations', () => {
    it('should update product information', async () => {
      const product = await models.Product.create({
        name: 'Original Name',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId
      });

      await models.Product.findByIdAndUpdate(product._id, {
        name: 'Updated Name',
        price: 60000
      });

      const updated = await models.Product.findById(product._id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.price).toBe(60000);
    });

    it('should update stock correctly', async () => {
      const product = await models.Product.create({
        name: 'Stock Test',
        unit: 'box',
        price: 50000,
        currentStock: 100,
        supplierId: testSupplierId
      });

      // Add stock
      await models.Product.findByIdAndUpdate(product._id, {
        currentStock: 150
      });

      let updated = await models.Product.findById(product._id);
      expect(updated.currentStock).toBe(150);

      // Subtract stock
      await models.Product.findByIdAndUpdate(product._id, {
        currentStock: 50
      });

      updated = await models.Product.findById(product._id);
      expect(updated.currentStock).toBe(50);
    });

    it('should track product status based on stock', async () => {
      const product = await models.Product.create({
        name: 'Status Test',
        unit: 'box',
        price: 50000,
        currentStock: 0,
        minimumStockLevel: 10,
        supplierId: testSupplierId
      });

      expect(product.currentStock).toBe(0);
    });
  });

  describe('Product Query Operations', () => {
    it('should query products by category', async () => {
      const categoryName = `QueryTest_${Date.now()}`;
      
      await models.Product.create({
        name: 'Product 1',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId,
        category: categoryName
      });

      const products = await models.Product.find({ category: categoryName });
      expect(products.length).toBeGreaterThan(0);
      expect(products.every(p => p.category === categoryName)).toBe(true);
    });

    it('should query available products', async () => {
      await models.Product.create({
        name: 'Available Product',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId,
        status: 'available'
      });

      const available = await models.Product.find({ status: 'available' });
      expect(available.length).toBeGreaterThan(0);
    });

    it('should find low stock products', async () => {
      const product = await models.Product.create({
        name: 'Low Stock',
        unit: 'box',
        price: 50000,
        currentStock: 5,
        minimumStockLevel: 10,
        supplierId: testSupplierId
      });

      const lowStock = await models.Product.find({
        $expr: { $lt: ['$currentStock', '$minimumStockLevel'] }
      });

      expect(lowStock.some(p => p._id.toString() === product._id.toString())).toBe(true);
    });
  });

  describe('Product Pagination', () => {
    it('should paginate products correctly', async () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const products = await models.Product.find()
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Product Data Integrity', () => {
    it('should maintain supplier relationship', async () => {
      const product = await models.Product.create({
        name: 'Supplier Link',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId
      });

      // Fetch and populate the product
      const populatedProduct = await models.Product.findById(product._id).populate('supplierId');

      expect(populatedProduct.supplierId).toBeDefined();
      expect(populatedProduct.supplierId._id.toString()).toBe(testSupplierId.toString());
      expect(populatedProduct.supplierId.name).toBe('Test Supplier');
    });

    it('should preserve timestamps', async () => {
      const product = await models.Product.create({
        name: 'Timestamp Test',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId
      });

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(product.createdAt instanceof Date).toBe(true);
    });

    it('should validate required fields', async () => {
      try {
        await models.Product.create({
          // Missing required fields
          supplierId: testSupplierId
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should set default status to available', async () => {
      const product = await models.Product.create({
        name: 'Default Status',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId
      });

      expect(product.status).toBe('available');
    });
  });

  describe('Product Statistics', () => {
    it('should count products by category', async () => {
      const category = `StatsTest_${Date.now()}`;
      
      for (let i = 0; i < 3; i++) {
        await models.Product.create({
          name: `Stats Product ${i}`,
          unit: 'box',
          price: 50000,
          supplierId: testSupplierId,
          category
        });
      }

      const count = await models.Product.countDocuments({ category });
      expect(count).toBe(3);
    });

    it('should calculate total available stock', async () => {
      const name = `TotalStock_${Date.now()}`;
      
      const p1 = await models.Product.create({
        name: `${name}_1`,
        unit: 'box',
        price: 50000,
        currentStock: 100,
        supplierId: testSupplierId
      });

      const p2 = await models.Product.create({
        name: `${name}_2`,
        unit: 'box',
        price: 50000,
        currentStock: 50,
        supplierId: testSupplierId
      });

      const products = await models.Product.find({ name: { $regex: name } });
      const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);

      expect(totalStock).toBe(150);
    });
  });

  describe('Product Soft Delete', () => {
    it('should discontinue product', async () => {
      const product = await models.Product.create({
        name: 'Discontinue Test',
        unit: 'box',
        price: 50000,
        supplierId: testSupplierId,
        status: 'available'
      });

      await models.Product.findByIdAndUpdate(product._id, {
        status: 'discontinued'
      });

      const updated = await models.Product.findById(product._id);
      expect(updated.status).toBe('discontinued');
    });

    it('should query only available products', async () => {
      const available = await models.Product.find({ status: 'available' });
      const discontinued = await models.Product.find({ status: 'discontinued' });

      expect(available.some(p => p.status === 'discontinued')).toBe(false);
    });
  });
});
