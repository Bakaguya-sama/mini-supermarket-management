<<<<<<< HEAD
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Promotion } = require('../models');
=======
/**
 * Integration Tests - Promotion API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723

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
<<<<<<< HEAD
});

describe('Promotion Integration Tests', () => {
  let adminToken;

  beforeEach(async () => {
    const adminAccount = await createAccount('admin');
    adminToken = makeTokenForAccount(adminAccount);
  });

  describe('GET /api/promotions', () => {
    test('should return all promotions', async () => {
      await Promotion.create([
        {
          promo_code: 'SUMMER20',
          discount_value: 20,
          discount_type: 'percentage',
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true
        },
        {
          promo_code: 'WELCOME10',
          discount_value: 100000,
          discount_type: 'fixed',
          start_date: new Date(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          is_active: true
        }
      ]);

      const res = await request(app).get('/api/promotions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/promotions/applicable', () => {
    test('should return applicable promotions', async () => {
      await Promotion.create({
        promo_code: 'ACTIVE',
        discount_value: 15,
        discount_type: 'percentage',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app).get('/api/promotions/applicable');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/promotions/:id', () => {
    test('should return a single promotion', async () => {
      const promo = await Promotion.create({
        promo_code: 'SINGLE',
        discount_value: 25,
        discount_type: 'percentage',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app).get(`/api/promotions/${promo._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promo_code).toBe('SINGLE');
    });
  });

  describe('POST /api/promotions/validate', () => {
    test('should validate applicable promo code', async () => {
      await Promotion.create({
        promo_code: 'VALID20',
        discount_value: 20,
        discount_type: 'percentage',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .post('/api/promotions/validate')
        .send({ promo_code: 'VALID20', total_amount: 500000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject expired promo code', async () => {
      await Promotion.create({
        promo_code: 'EXPIRED',
        discount_value: 20,
        discount_type: 'percentage',
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .post('/api/promotions/validate')
        .send({ promo_code: 'EXPIRED', total_amount: 500000 });

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('POST /api/promotions', () => {
    test('should create new promotion', async () => {
      const payload = {
        promo_code: 'NEW50',
        discount_value: 50,
        discount_type: 'percentage',
        start_date: new Date(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        is_active: true
      };

      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promo_code).toBe('NEW50');
    });
  });

  describe('PUT /api/promotions/:id', () => {
    test('should update promotion', async () => {
      const promo = await Promotion.create({
        promo_code: 'UPDATE',
        discount_value: 10,
        discount_type: 'percentage',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .put(`/api/promotions/${promo._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ discount_value: 15 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/promotions/:id', () => {
    test('should delete promotion', async () => {
      const promo = await Promotion.create({
        promo_code: 'DELETE',
        discount_value: 30,
        discount_type: 'percentage',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .delete(`/api/promotions/${promo._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
=======
  const { Promotion } = require('../models');
  await Promotion.deleteMany({});
});

const makePromotion = (overrides = {}) => ({
  name: 'Test Promo',
  promo_code: 'PROMO123',
  promotion_type: 'percentage',
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
  expect(res.body.data.promo_code).toBe('PROMO123');
});

test('TC02: GET /api/promotions - returns list of promotions', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ promo_code: 'LIST1' }));
  await Promotion.create(makePromotion({ promo_code: 'LIST2' }));

  const res = await request(app).get('/api/promotions');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(2);
});

test('TC03: GET /api/promotions/validate - validates a promo code', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ promo_code: 'VALIDATE', discount_value: 20 }));

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
  const promo = await Promotion.create(makePromotion({ promo_code: 'DELETE' }));

  const res = await request(app).delete(`/api/promotions/${promo._id}`);
  expect(res.status).toBe(200);
  
  const deleted = await Promotion.findById(promo._id);
  expect(deleted.isDelete).toBe(true);
});

test('TC06: GET /api/promotions/applicable - returns promotions for a subtotal', async () => {
  const { Promotion } = require('../models');
  await Promotion.create(makePromotion({ promo_code: 'APP1', min_purchase_amount: 100000 }));
  await Promotion.create(makePromotion({ promo_code: 'APP2', min_purchase_amount: 1000 }));

  const res = await request(app).get('/api/promotions/applicable?subtotal=50000');
  expect(res.status).toBe(200);
  // Should only find APP2, not APP1
  expect(res.body.data.some(p => p.promo_code === 'APP2')).toBe(true);
  expect(res.body.data.some(p => p.promo_code === 'APP1')).toBe(false);
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723
});
