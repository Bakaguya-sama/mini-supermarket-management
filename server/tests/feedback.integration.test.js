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

test('POST /api/feedbacks and GET /api/feedbacks work', async () => {
  const acc = await Account.create({ username: 'f1', email: 'f1@example.com', role: 'customer', full_name: 'F1' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const res1 = await request(app)
    .post('/api/feedbacks')
    .send({ category: 'complaint', subject: 'Test', detail: 'Details', customer_id: customer._id, rating: 3 });

  expect(res1.status).toBe(201);
  expect(res1.body.success).toBe(true);
  expect(res1.body.data._id).toBeDefined();

  const res2 = await request(app).get('/api/feedbacks');
  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
  expect(res2.body.count).toBeGreaterThan(0);
});
