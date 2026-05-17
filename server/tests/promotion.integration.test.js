const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Promotion } = require('../models');

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
          name: 'Summer Sale',
          promo_code: 'SUMMER20',
          discount_value: 20,
          discount_type: 'percentage',
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true
        },
        {
          name: 'Welcome Gift',
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
        name: 'Active Promo',
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
        name: 'Single Promo',
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
        name: 'Valid Promo',
        promo_code: 'VALID20',
        discount_value: 20,
        discount_type: 'percentage',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .post('/api/promotions/validate')
        .send({ promo_code: 'VALID20', subtotal: 500000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject expired promo code', async () => {
      await Promotion.create({
        name: 'Expired Promo',
        promo_code: 'EXPIRED',
        discount_value: 20,
        discount_type: 'percentage',
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        is_active: true
      });

      const res = await request(app)
        .post('/api/promotions/validate')
        .send({ promo_code: 'EXPIRED', subtotal: 500000 });

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('POST /api/promotions', () => {
    test('should create new promotion', async () => {
      const payload = {
        name: 'New Promotion',
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
        name: 'Update Promo',
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
        name: 'Delete Promo',
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
});
