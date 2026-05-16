/**
 * Integration Tests - DamagedProduct API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
const { Product, ProductShelf } = require('../models');

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

test('TC01: POST /api/damaged-products - reports damaged product successfully', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box', price: 20000, current_stock: 100 });
  
  const res = await request(app)
    .post('/api/damaged-products')
    .send({
      product_id: product._id,
      damaged_quantity: 5,
      description: 'Broken seal'
    });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.product_name).toBe('Milk');
});

test('TC02: GET /api/damaged-products - returns list with pagination', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box', price: 20000 });
  await models.DamagedProduct.create({ product_id: product._id, product_name: 'Milk', damaged_quantity: 1, status: 'reported' });

  const res = await request(app).get('/api/damaged-products?page=1&limit=10');
  expect(res.status).toBe(200);
  expect(res.body.data.damagedProducts.length).toBeGreaterThan(0);
  expect(res.body.data.total).toBeGreaterThanOrEqual(1);
});

test('TC03: GET /api/damaged-products/stats - returns summary stats', async () => {
  const res = await request(app).get('/api/damaged-products/stats');
  expect(res.status).toBe(200);
  expect(res.body.data).toHaveProperty('total');
  expect(res.body.data).toHaveProperty('pendingReview');
});

test('TC04: PATCH /api/damaged-products/:id/adjust - deducts from warehouse inventory', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box', price: 20000, current_stock: 100 });
  const dp = await models.DamagedProduct.create({ 
    product_id: product._id, product_name: 'Milk', 
    damaged_quantity: 10, inventory_adjusted: false 
  });

  const res = await request(app).patch(`/api/damaged-products/${dp._id}/adjust`);
  expect(res.status).toBe(200);
  expect(res.body.data.damagedProduct.inventory_adjusted).toBe(true);
  expect(res.body.data.product.current_stock).toBe(90);
});

test('TC05: PATCH /api/damaged-products/:id - updates report details', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box' });
  const dp = await models.DamagedProduct.create({ product_id: product._id, product_name: 'Milk', damaged_quantity: 1 });

  const res = await request(app)
    .patch(`/api/damaged-products/${dp._id}`)
    .send({ status: 'reviewed', notes: 'Verified by manager' });

  expect(res.status).toBe(200);
  expect(res.body.data.status).toBe('reviewed');
  expect(res.body.data.notes).toBe('Verified by manager');
});

test('TC06: POST /api/damaged-products/bulk-status - updates multiple reports', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box' });
  const dp1 = await models.DamagedProduct.create({ product_id: product._id, product_name: 'Milk', damaged_quantity: 1 });
  const dp2 = await models.DamagedProduct.create({ product_id: product._id, product_name: 'Milk', damaged_quantity: 1 });

  const res = await request(app)
    .post('/api/damaged-products/bulk-status')
    .send({ ids: [dp1._id, dp2._id], status: 'closed' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});
