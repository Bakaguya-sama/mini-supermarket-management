const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Product, Shelf, Section, Supplier, ProductStock } = require('../models');

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

describe('ProductStock Integration Tests', () => {
  let adminToken;
  let productId;
  let shelfId;

  beforeEach(async () => {
    const adminAccount = await createAccount('admin');
    adminToken = makeTokenForAccount(adminAccount);

    const supplier = await Supplier.create({
      name: 'Test Supplier',
      contact_name: 'John',
      email: 'supplier@test.com',
      phone: '0123456789',
      address: '123 St'
    });

    const product = await Product.create({
      name: 'Stock Test Product',
      sku: 'SKU_STOCK',
      category: 'Electronics',
      unit: 'Piece',
      current_stock: 100,
      unit_price: 50000,
      supplier_id: supplier._id.toString()
    });
    productId = product._id.toString();

    const section = await Section.create({
      section_name: 'Test Section',
      location: 'Floor 1'
    });

    const shelf = await Shelf.create({
      shelf_number: 'A1',
      shelf_name: 'A',
      section_number: 1,
      capacity: 100,
      current_quantity: 50
    });
    shelfId = shelf._id.toString();
  });

  describe('GET /api/product-stock/stats', () => {
    test('should return product stock statistics', async () => {
      const res = await request(app).get('/api/product-stock/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-stock/low-stock', () => {
    test('should return low stock products', async () => {
      const res = await request(app).get('/api/product-stock/low-stock');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-stock/product/:productId', () => {
    test('should return stock for a product', async () => {
      const res = await request(app).get(`/api/product-stock/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-stock/shelf/:shelfId', () => {
    test('should return stock by shelf', async () => {
      const res = await request(app).get(`/api/product-stock/shelf/${shelfId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/product-stock/:id/adjust', () => {
    test('should adjust stock quantity', async () => {
      // Create a stock record first
      const stock = await ProductStock.create({
        product_id: productId,
        shelf_id: shelfId,
        quantity: 50,
        status: 'in_stock'
      });

      const res = await request(app)
        .put(`/api/product-stock/${stock._id.toString()}/adjust`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity_adjustment: -5, reason: 'Damage' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/product-stock/bulk/update-status', () => {
    test('should bulk update stock status', async () => {
      const stock1 = await ProductStock.create({
        product_id: productId,
        shelf_id: shelfId,
        quantity: 50,
        status: 'in_stock'
      });

      const res = await request(app)
        .put('/api/product-stock/bulk/update-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          stock_ids: [stock1._id.toString()],
          status: 'low_stock'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
