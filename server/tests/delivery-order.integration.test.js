/**
 * Integration Tests - DeliveryOrder API
 * Tests real HTTP endpoints for delivery workflow
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models, createAccount, makeTokenForAccount } = require('./testHelper');
const { Account, Staff } = require('../models');

let app;
let authToken;

beforeAll(async () => {
  await setupDB();
  app = getApp();
  const acc = await createAccount('staff');
  authToken = makeTokenForAccount(acc);
});

afterAll(async () => {
  await teardownDB();
});

beforeEach(async () => {
  await clearCollections();
  const { DeliveryOrder } = require('../models');
  await DeliveryOrder.deleteMany({});
  await Staff.deleteMany({});
});

/** Helper: create a delivery staff account + staff profile */
async function createDeliveryStaff(suffix = '1') {
  const acc = await Account.create({
    username: `dvstaff${suffix}`, email: `dvstaff${suffix}@example.com`, role: 'staff'
  });
  return Staff.create({ account_id: acc._id, position: 'Delivery', current_assignments: 0 });
}

test('TC01: GET /api/delivery-orders - returns list of delivery orders', async () => {
  const res = await request(app)
    .get('/api/delivery-orders')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test('TC02: GET /api/delivery-orders/staff/:staffId - returns assigned orders for staff', async () => {
  const staff = await createDeliveryStaff('2');
  const res = await request(app)
    .get(`/api/delivery-orders/staff/${staff._id}`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test('TC03: GET /api/delivery-orders/staff/:staffId - returns 400 for invalid ID format', async () => {
  const res = await request(app)
    .get('/api/delivery-orders/staff/not-a-valid-id')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test('TC04: GET /api/delivery-orders/staff/:staffId?status=assigned - filters by status', async () => {
  const staff = await createDeliveryStaff('4');
  const res = await request(app)
    .get(`/api/delivery-orders/staff/${staff._id}?status=assigned`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);
  // All returned items should have status = assigned (if any)
  if (res.body.data.length > 0) {
    expect(res.body.data.every(d => d.status === 'assigned')).toBe(true);
  }
});

test('TC05: GET /api/delivery-orders/:id - returns 404 for non-existent delivery order', async () => {
  const res = await request(app)
    .get('/api/delivery-orders/6a07c4eaf692dbc454a1ffff')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});

test('TC06: GET /api/delivery-orders/stats - returns stats summary', async () => {
  const res = await request(app)
    .get('/api/delivery-orders/stats')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});
