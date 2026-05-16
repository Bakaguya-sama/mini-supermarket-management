<<<<<<< HEAD
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount } = require('./testHelper');
const { Section } = require('../models');
=======
/**
 * Integration Tests - Section API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
const { Section, Shelf } = require('../models');
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
});

<<<<<<< HEAD
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
=======
test('TC01: POST /api/sections - creates a section successfully', async () => {
  const res = await request(app)
    .post('/api/sections')
    .send({
      section_name: 'Bakery',
      note: 'Fresh bread and pastries'
    });

  expect(res.status).toBe(201);
  expect(res.body.data.section_name).toBe('Bakery');
});

test('TC02: GET /api/sections - returns list of sections', async () => {
  await Section.create({ section_name: 'Sec1' });
  await Section.create({ section_name: 'Sec2' });

  const res = await request(app).get('/api/sections');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(2);
});

test('TC03: GET /api/sections/:id - returns section with shelves', async () => {
  const section = await Section.create({ section_name: 'Sec3' });
  await Shelf.create({ shelf_number: 'S3-1', shelf_name: 'S3', section_number: 3, section: section._id, capacity: 50 });

  const res = await request(app).get(`/api/sections/${section._id}`);
  expect(res.status).toBe(200);
  expect(res.body.data.section_name).toBe('Sec3');
  expect(res.body.data.shelves.length).toBe(1);
});

test('TC04: DELETE /api/sections/:id - deletes section', async () => {
  const section = await Section.create({ section_name: 'ToDelete' });

  const res = await request(app).delete(`/api/sections/${section._id}`);
  expect(res.status).toBe(200);
  
  const check = await Section.findById(section._id);
  expect(check.isDelete).toBe(true);
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723
});
