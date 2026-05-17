const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Section } = require('../models');

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

describe('Section Integration Tests', () => {
  let adminToken;

  beforeEach(async () => {
    const adminAccount = await createAccount('admin');
    adminToken = makeTokenForAccount(adminAccount);
  });

  describe('GET /api/sections', () => {
    test('should return all sections', async () => {
      await Section.create([
        { section_name: 'Electronics', location: 'Floor 1' },
        { section_name: 'Food', location: 'Floor 2' }
      ]);

      const res = await request(app).get('/api/sections');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/sections/:id', () => {
    test('should return a single section', async () => {
      const section = await Section.create({
        section_name: 'Beverages',
        location: 'Floor 1'
      });

      const res = await request(app).get(`/api/sections/${section._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.section_name).toBe('Beverages');
    });
  });

  describe('POST /api/sections', () => {
    test('should create a new section', async () => {
      const payload = {
        section_name: 'Household',
        location: 'Floor 3'
      };

      const res = await request(app)
        .post('/api/sections')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.section_name).toBe('Household');
    });

    test('should fail with duplicate section name', async () => {
      await Section.create({ section_name: 'Duplicate', location: 'Floor 1' });

      const res = await request(app)
        .post('/api/sections')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ section_name: 'Duplicate', location: 'Floor 2' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/sections/:id', () => {
    test('should update section', async () => {
      const section = await Section.create({
        section_name: 'Original',
        location: 'Floor 1'
      });

      const res = await request(app)
        .put(`/api/sections/${section._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ location: 'Floor 2' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/sections/:id', () => {
    test('should delete section', async () => {
      const section = await Section.create({
        section_name: 'ToDelete',
        location: 'Floor 1'
      });

      const res = await request(app)
        .delete(`/api/sections/${section._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
