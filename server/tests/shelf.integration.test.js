const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Shelf, Section } = require('../models');

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

describe('Shelf Integration Tests', () => {
  let adminToken;
  let sectionId;

  beforeEach(async () => {
    const adminAccount = await createAccount('admin');
    adminToken = makeTokenForAccount(adminAccount);

    const section = await Section.create({
      section_name: 'Test Section',
      location: 'Floor 1'
    });
    sectionId = section._id.toString();
  });

  describe('GET /api/shelves/stats', () => {
    test('should return shelf statistics', async () => {
      const res = await request(app).get('/api/shelves/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/shelves/available', () => {
    test('should return available shelves', async () => {
      await Shelf.create({
        shelf_number: 'A1',
        shelf_name: 'A',
        section_number: 1,
        capacity: 100,
        current_quantity: 30
      });

      const res = await request(app).get('/api/shelves/available');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/shelves/category/:category', () => {
    test('should return shelves by category', async () => {
      await Shelf.create({
        shelf_number: 'B1',
        shelf_name: 'B',
        section_number: 1,
        capacity: 150,
        current_quantity: 50
      });

      const res = await request(app).get('/api/shelves/category/Food');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/shelves/:id/capacity', () => {
    test('should return shelf capacity', async () => {
      const shelf = await Shelf.create({
        shelf_number: 'C1',
        shelf_name: 'C',
        section_number: 1,
        capacity: 200,
        current_quantity: 75
      });

      const res = await request(app).get(
        `/api/shelves/${shelf._id.toString()}/capacity`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/shelves/:id/toggle-full', () => {
    test('should toggle shelf full status', async () => {
      const shelf = await Shelf.create({
        shelf_number: 'D1',
        shelf_name: 'D',
        section_number: 1,
        capacity: 100,
        current_quantity: 100,
        is_full: false
      });

      const res = await request(app)
        .put(`/api/shelves/${shelf._id.toString()}/toggle-full`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
