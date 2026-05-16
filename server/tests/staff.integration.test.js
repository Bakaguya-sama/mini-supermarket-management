const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
const { Account, Staff } = require('../models');

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
  await Staff.deleteMany({});
});

test('TC01: POST /api/staff - creates staff with valid data', async () => {
  const res = await request(app)
    .post('/api/staff')
    .send({ username: 'staff_new', email: 'staff_new@example.com', full_name: 'Staff New', position: 'Delivery', password: 'test_user_auth_123' });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.position).toBe('Delivery');
});

test('TC02: POST /api/staff - rejects missing required fields', async () => {
  const res = await request(app)
    .post('/api/staff')
    .send({ username: 'incomplete' }); // missing password, email, position

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test('TC03: GET /api/staff - returns staff list', async () => {
  const acc = await Account.create({ username: 'slist1', email: 'slist1@example.com', role: 'staff' });
  await Staff.create({ account_id: acc._id, position: 'Cashier' });

  const res = await request(app).get('/api/staff');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.count).toBeGreaterThanOrEqual(1);
});

test('TC04: GET /api/staff/:id - returns specific staff', async () => {
  const acc = await Account.create({ username: 'sget1', email: 'sget1@example.com', role: 'staff' });
  const staff = await Staff.create({ account_id: acc._id, position: 'Warehouse' });

  const res = await request(app).get(`/api/staff/${staff._id}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.position).toBe('Warehouse');
});

test('TC05: GET /api/staff/:id - returns 404 for non-existent ID', async () => {
  const fakeId = '6a07c4eaf692dbc454a1ffff';
  const res = await request(app).get(`/api/staff/${fakeId}`);
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});

test('TC06: DELETE /api/staff/:id - soft-deletes a staff member', async () => {
  const acc = await Account.create({ username: 'sdel1', email: 'sdel1@example.com', role: 'staff' });
  const staff = await Staff.create({ account_id: acc._id, position: 'Cashier' });

  const res = await request(app).delete(`/api/staff/${staff._id}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});

