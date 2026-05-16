/**
 * Integration Tests - Feedback API
 * Tests real HTTP endpoints for customer feedback workflow
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
const { Account } = require('../models');

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

test('TC01: POST /api/feedbacks - creates feedback successfully', async () => {
  const acc = await Account.create({ username: 'fbcust1', email: 'fbcust1@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const res = await request(app)
    .post('/api/feedbacks')
    .send({ customer_id: customer._id, category: 'praise', subject: 'Great service', detail: 'Very fast delivery!' });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.category).toBe('praise');
  expect(res.body.data.status).toBe('open');
});

test('TC02: POST /api/feedbacks - returns 400 when required fields are missing', async () => {
  const res = await request(app)
    .post('/api/feedbacks')
    .send({ detail: 'missing other fields' });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test('TC03: GET /api/feedbacks - returns list of all feedback', async () => {
  const acc = await Account.create({ username: 'fbcust3', email: 'fbcust3@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });

  await request(app).post('/api/feedbacks').send({
    customer_id: customer._id, category: 'complaint', subject: 'Wrong item', detail: 'Wrong item was sent'
  });

  const res = await request(app).get('/api/feedbacks');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.length).toBeGreaterThan(0);
});

test('TC04: GET /api/feedbacks/:id - returns feedback by ID', async () => {
  const acc = await Account.create({ username: 'fbcust4', email: 'fbcust4@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const createRes = await request(app).post('/api/feedbacks').send({
    customer_id: customer._id, category: 'suggestion', subject: 'Add more products', detail: 'Would love to see organic range'
  });
  const fbId = createRes.body.data._id;

  const res = await request(app).get(`/api/feedbacks/${fbId}`);
  expect(res.status).toBe(200);
  expect(res.body.data.subject).toBe('Add more products');
});

test('TC05: GET /api/feedbacks - filters by category=complaint', async () => {
  const acc = await Account.create({ username: 'fbcust5', email: 'fbcust5@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });

  await request(app).post('/api/feedbacks').send({
    customer_id: customer._id, category: 'complaint', subject: 'Late delivery', detail: 'Order arrived 3 days late'
  });

  const res = await request(app).get('/api/feedbacks?category=complaint');
  expect(res.status).toBe(200);
  if (res.body.data.length > 0) {
    expect(res.body.data.every(f => f.category === 'complaint')).toBe(true);
  }
});

test('TC06: GET /api/feedbacks/:id - returns 404 for non-existent feedback', async () => {
  const res = await request(app).get('/api/feedbacks/6a07c4eaf692dbc454a1ffff');
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});
