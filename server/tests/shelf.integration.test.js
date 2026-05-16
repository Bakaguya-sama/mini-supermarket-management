/**
 * Integration Tests - Shelf API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
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

test('TC01: POST /api/shelves - creates a shelf successfully', async () => {
  const section = await Section.create({ section_name: 'Dairy' });
  
  const res = await request(app)
    .post('/api/shelves')
    .send({
      shelf_number: 'D101',
      category: 'Dairy',
      capacity: 100,
      section: section._id
    });

  expect(res.status).toBe(201);
  expect(res.body.data.shelf_number).toBe('D101');
  expect(res.body.data.shelf_name).toBe('Dairy');
});

test('TC02: GET /api/shelves - returns list with filters', async () => {
  await Shelf.create({ shelf_number: 'A1', category: 'Dry', capacity: 50 });
  await Shelf.create({ shelf_number: 'B1', category: 'Frozen', capacity: 50 });

  const res = await request(app).get('/api/shelves?category=Dry');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(1);
  expect(res.body.data[0].shelf_number).toBe('A1');
});

test('TC03: GET /api/shelves/stats - returns shelf statistics', async () => {
  await Shelf.create({ shelf_number: 'S1', isfull: true });
  await Shelf.create({ shelf_number: 'S2', isfull: false });

  const res = await request(app).get('/api/shelves/stats');
  expect(res.status).toBe(200);
  expect(res.body.data.total).toBe(2);
  expect(res.body.data.full).toBe(1);
  expect(res.body.data.available).toBe(1);
});

test('TC04: PUT /api/shelves/:id/toggle-full - toggles status', async () => {
  const shelf = await Shelf.create({ shelf_number: 'T1', isfull: false });

  const res = await request(app).put(`/api/shelves/${shelf._id}/toggle-full`);
  expect(res.status).toBe(200);
  expect(res.body.data.isfull).toBe(true);
});

test('TC05: DELETE /api/shelves/:id - deletes shelf if empty', async () => {
  const shelf = await Shelf.create({ shelf_number: 'DEL1' });

  const res = await request(app).delete(`/api/shelves/${shelf._id}`);
  expect(res.status).toBe(200);
  
  const check = await Shelf.findById(shelf._id);
  expect(check.isDelete).toBe(true);
});
