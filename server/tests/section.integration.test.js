/**
 * Integration Tests - Section API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
const { Section, Shelf } = require('../models');

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
  await Shelf.create({ shelf_number: 'S3-1', section: section._id, capacity: 50 });

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
});
