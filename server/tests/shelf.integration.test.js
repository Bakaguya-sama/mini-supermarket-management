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
      shelf_number: 'D1',
      shelf_name: 'D',
      section_number: 1,
      capacity: 100,
      section: section._id
    });

  expect(res.status).toBe(201);
  expect(res.body.data.shelf_number).toBe('D101');
});

test('TC02: GET /api/shelves - returns list with filters', async () => {
  await Shelf.create({ shelf_number: 'A1', shelf_name: 'A', section_number: 1, capacity: 50 });
  await Shelf.create({ shelf_number: 'B1', shelf_name: 'B', section_number: 2, capacity: 50 });

  const res = await request(app).get('/api/shelves?shelf_name=A');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(1);
  expect(res.body.data[0].shelf_number).toBe('A1');
});

test('TC03: GET /api/shelves/stats - returns shelf statistics', async () => {
  // Stats controller checks current_quantity vs capacity to determine full
  await Shelf.create({ shelf_number: 'S1', shelf_name: 'S', section_number: 1, capacity: 10, current_quantity: 10 });
  await Shelf.create({ shelf_number: 'S2', shelf_name: 'S', section_number: 1, capacity: 10, current_quantity: 0 });

  const res = await request(app).get('/api/shelves/stats');
  expect(res.status).toBe(200);
  expect(res.body.data.total).toBe(2);
});

test('TC04: PUT /api/shelves/:id/toggle-full - toggles status', async () => {
  const shelf = await Shelf.create({ shelf_number: 'T1', shelf_name: 'T', section_number: 1 });

  const res = await request(app).put(`/api/shelves/${shelf._id}/toggle-full`);
  expect(res.status).toBe(200);
});

test('TC05: DELETE /api/shelves/:id - deletes shelf if empty', async () => {
  const shelf = await Shelf.create({ shelf_number: 'DEL1', shelf_name: 'D', section_number: 1 });

  const res = await request(app).delete(`/api/shelves/${shelf._id}`);
  expect(res.status).toBe(200);
  
  const check = await Shelf.findById(shelf._id);
  expect(check.isDelete).toBe(true);
});
