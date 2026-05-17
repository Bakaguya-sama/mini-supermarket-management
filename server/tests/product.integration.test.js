const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Product, Supplier } = require('../models');

let app;

beforeAll(async () => {
  await setupDB();
  app = getApp();
});

afterAll(async () => {
  await teardownDB();
});

beforeEach(async () => {
  await clearCollections();
});

describe('Product Integration Tests', () => {
  let adminToken;
  let supplierId;

  beforeEach(async () => {
    // Create admin account and get token
    const adminAccount = await createAccount('admin');
    adminToken = makeTokenForAccount(adminAccount);

    // Create a supplier for testing
    const supplier = await Supplier.create({
      name: 'Test Supplier',
      contact_name: 'John Doe',
      email: 'supplier@example.com',
      phone: '0123456789',
      address: '123 Main St'
    });
    supplierId = supplier._id.toString();
  });

  describe('GET /api/products', () => {
    test('should return list of all products', async () => {
      // Create test products
      await Product.create([
        {
          name: 'Product 1',
          sku: 'SKU001',
          category: 'Electronics',
          unit: 'Piece',
          current_stock: 100,
          unit_price: 50000,
          supplier_id: supplierId
        },
        {
          name: 'Product 2',
          sku: 'SKU002',
          category: 'Food',
          unit: 'Box',
          current_stock: 200,
          unit_price: 25000,
          supplier_id: supplierId
        }
      ]);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/products/stats', () => {
    test('should return product statistics', async () => {
      await Product.create({
        name: 'Stat Product',
        sku: 'SKU_STAT',
        category: 'Test',
        unit: 'Bottle',
        current_stock: 150,
        unit_price: 30000,
        supplier_id: supplierId
      });

      const res = await request(app).get('/api/products/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('GET /api/products/low-stock', () => {
    test('should return low stock products', async () => {
      await Product.create({
        name: 'Low Stock Product',
        sku: 'SKU_LOW',
        category: 'Test',
        unit: 'Piece',
        current_stock: 5,
        unit_price: 40000,
        supplier_id: supplierId
      });

      const res = await request(app).get('/api/products/low-stock');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/products/category/:category', () => {
    test('should return products by category', async () => {
      await Product.create({
        name: 'Category Product',
        sku: 'SKU_CAT',
        category: 'Beverages',
        unit: 'Bottle',
        current_stock: 100,
        unit_price: 15000,
        supplier_id: supplierId
      });

      const res = await request(app).get('/api/products/category/Beverages');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return a single product', async () => {
      const product = await Product.create({
        name: 'Single Product',
        sku: 'SKU_SINGLE',
        category: 'Electronics',
        unit: 'Unit',
        current_stock: 80,
        unit_price: 60000,
        supplier_id: supplierId
      });

      const res = await request(app).get(`/api/products/${product._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Single Product');
    });

    test('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/000000000000000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product', async () => {
      const payload = {
        name: 'New Product',
        sku: 'SKU_NEW',
        category: 'Food',
        unit: 'Box',
        current_stock: 100,
        unit_price: 35000,
        description: 'A new product',
        supplier_id: supplierId
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Product');
    });

    test('should fail without admin token', async () => {
      const payload = {
        name: 'Unauthorized Product',
        sku: 'SKU_UNAUTH',
        category: 'Test',
        unit: 'Piece',
        current_stock: 50,
        unit_price: 20000,
        supplier_id: supplierId
      };

      const res = await request(app)
        .post('/api/products')
        .send(payload);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product successfully', async () => {
      const product = await Product.create({
        name: 'Update Product',
        sku: 'SKU_UPDATE',
        category: 'Electronics',
        unit: 'Piece',
        current_stock: 50,
        unit_price: 55000,
        supplier_id: supplierId
      });

      const res = await request(app)
        .put(`/api/products/${product._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          unit_price: 60000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe('Updated Product');
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    test('should update product stock', async () => {
      const product = await Product.create({
        name: 'Stock Product',
        sku: 'SKU_STOCK',
        category: 'Test',
        unit: 'Piece',
        current_stock: 100,
        unit_price: 30000,
        supplier_id: supplierId
      });

      const res = await request(app)
        .patch(`/api/products/${product._id.toString()}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ current_stock: 150 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/products/:id/price', () => {
    test('should update product price', async () => {
      const product = await Product.create({
        name: 'Price Product',
        sku: 'SKU_PRICE',
        category: 'Test',
        unit: 'Box',
        current_stock: 100,
        unit_price: 50000,
        supplier_id: supplierId
      });

      const res = await request(app)
        .patch(`/api/products/${product._id.toString()}/price`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 55000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should soft delete product', async () => {
      const product = await Product.create({
        name: 'Delete Product',
        sku: 'SKU_DELETE',
        category: 'Test',
        unit: 'Piece',
        current_stock: 100,
        unit_price: 30000,
        supplier_id: supplierId
      });

      const res = await request(app)
        .delete(`/api/products/${product._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
