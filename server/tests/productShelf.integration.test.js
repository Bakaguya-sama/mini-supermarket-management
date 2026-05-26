const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Product, Shelf, Section, Supplier } = require('../models');

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

describe('ProductShelf Integration Tests', () => {
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
      name: 'Shelf Test Product',
      sku: 'SKU_SHELF',
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

  describe('GET /api/product-shelves/stats', () => {
    test('should return product shelf statistics', async () => {
      const res = await request(app).get('/api/product-shelves/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-shelves/product/:productId/shelves', () => {
    test('should return shelves for a product', async () => {
      const res = await request(app).get(
        `/api/product-shelves/product/${productId}/shelves`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-shelves/shelf/:shelfId/products', () => {
    test('should return products on a shelf', async () => {
      const res = await request(app).get(
        `/api/product-shelves/shelf/${shelfId}/products`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/product-shelves/bulk/assign', () => {
    test('should bulk assign products to shelf', async () => {
      const res = await request(app)
        .post('/api/product-shelves/bulk/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          product_ids: [productId],
          shelf_id: shelfId,
          quantity_per_product: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/product-shelves/:id/move', () => {
    test('should move product to different shelf', async () => {
      const section = await Section.create({
        section_name: 'New Section',
        location: 'Floor 2'
      });

      const newShelf = await Shelf.create({
        shelf_number: 201,
        section_id: section._id.toString(),
        category: 'Electronics',
        capacity: 80,
        current_load: 30
      });

      const res = await request(app)
        .put(`/api/product-shelves/${productId}/move`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          from_shelf_id: shelfId,
          to_shelf_id: newShelf._id.toString(),
          quantity: 5
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/product-shelves/for-damaged-record', () => {
    test('should return products for damaged record', async () => {
      const res = await request(app).get('/api/product-shelves/for-damaged-record');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
