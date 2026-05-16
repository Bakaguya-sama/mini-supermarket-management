/**
 * Integration Tests - Promotion API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');

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
  const { Promotion } = require('../models');
  await Promotion.deleteMany({});
});

const makePromotion = (overrides = {}) => ({
  name: 'Test Promo',
  code: 'PROMO123',
  discount_type: 'percentage',
  discount_value: 10,
  start_date: new Date(Date.now() - 86400000), // yesterday
  end_date: new Date(Date.now() + 86400000),   // tomorrow
  min_purchase_amount: 0,
  isDelete: false,
  ...overrides
});

test('TC01: POST /api/promotions - creates a promotion successfully', async () => {
  const res = await request(app)
    .post('/api/promotions')
    .send(makePromotion());

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.code).toBe('PROMO123');
});

test('TC02: GET /api/promotions - returns list of promotions', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ code: 'LIST1' }));
  await Promotion.create(makePromotion({ code: 'LIST2' }));

  const res = await request(app).get('/api/promotions');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(2);
});

test('TC03: GET /api/promotions/validate - validates a promo code', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ code: 'VALIDATE', discount_value: 20 }));

  const res = await request(app).get('/api/promotions/validate?code=VALIDATE&subtotal=100000');
  expect(res.status).toBe(200);
  expect(res.body.data.isValid).toBe(true);
  expect(res.body.data.discount_amount).toBe(20000);
});

test('TC04: GET /api/promotions/validate - returns 404 for non-existent code', async () => {
  const res = await request(app).get('/api/promotions/validate?code=NONEXISTENT&subtotal=100');
  expect(res.status).toBe(404);
});

test('TC05: DELETE /api/promotions/:id - soft deletes a promotion', async () => {
  const { Promotion } = require('../models');
  const promo = await Promotion.create(makePromotion({ code: 'DELETE' }));

  const res = await request(app).delete(`/api/promotions/${promo._id}`);
  expect(res.status).toBe(200);
  
  const deleted = await Promotion.findById(promo._id);
  expect(deleted.isDelete).toBe(true);
});

test('TC06: GET /api/promotions/applicable - returns promotions for a subtotal', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ code: 'APP1', min_purchase_amount: 100000 }));
  await Promotion.create(makePromotion({ code: 'APP2', min_purchase_amount: 1000 }));

  const res = await request(app).get('/api/promotions/applicable?subtotal=50000');
  expect(res.status).toBe(200);
  // Should only find APP2, not APP1
  expect(res.body.data.some(p => p.code === 'APP2')).toBe(true);
  expect(res.body.data.some(p => p.code === 'APP1')).toBe(false);
});
