const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { DamagedProduct, Product, Supplier, Shelf, Section } = require('../models');

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

describe('DamagedProduct Integration Tests', () => {
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
      name: 'Test Product',
      sku: 'SKU001',
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

  describe('GET /api/damaged-products/stats', () => {
    test('should return damaged product statistics', async () => {
      const res = await request(app).get('/api/damaged-products/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/damaged-products/product/:productId', () => {
    test('should return damaged products by product id', async () => {
      await DamagedProduct.create({
        product_id: productId,
        quantity: 5,
        damage_reason: 'Broken packaging',
        reported_date: new Date(),
        status: 'pending'
      });

      const res = await request(app).get(`/api/damaged-products/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/damaged-products/:id/adjust-inventory', () => {
    test('should adjust inventory for damaged product', async () => {
      const damaged = await DamagedProduct.create({
        product_id: productId,
        quantity: 5,
        damage_reason: 'Expired',
        reported_date: new Date(),
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/damaged-products/${damaged._id.toString()}/adjust-inventory`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity_to_remove: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/damaged-products/:id/shelves', () => {
    test('should get shelves for damaged product', async () => {
      const damaged = await DamagedProduct.create({
        product_id: productId,
        quantity: 2,
        damage_reason: 'Water damage',
        reported_date: new Date(),
        status: 'resolved'
      });

      const res = await request(app).get(
        `/api/damaged-products/${damaged._id.toString()}/shelves`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/damaged-products/bulk/update-status', () => {
    test('should bulk update damaged product status', async () => {
      const damaged1 = await DamagedProduct.create({
        product_id: productId,
        quantity: 2,
        damage_reason: 'Scratch',
        reported_date: new Date(),
        status: 'pending'
      });

      const damaged2 = await DamagedProduct.create({
        product_id: productId,
        quantity: 3,
        damage_reason: 'Dent',
        reported_date: new Date(),
        status: 'pending'
      });

      const res = await request(app)
        .put('/api/damaged-products/bulk/update-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ids: [damaged1._id.toString(), damaged2._id.toString()],
          status: 'resolved'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
