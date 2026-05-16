const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, makeTokenForAccount, models } = require('./testHelper');
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

test('GET /api/customers returns array and POST /api/customers creates customer (admin)', async () => {
  // GET initially empty
  const res1 = await request(app).get('/api/customers');
  expect(res1.status).toBe(200);
  expect(res1.body.success).toBe(true);

  // create admin account and token
  const admin = await Account.create({ username: 'admin1', email: 'admin1@example.com', role: 'admin', full_name: 'Admin' });
  const token = makeTokenForAccount(admin);

  // create customer via API
  const payload = { username: 'newcust', email: 'newcust@example.com', full_name: 'New Customer', password: 'password123' };
  const res2 = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);

  expect(res2.status).toBe(201);
  expect(res2.body.success).toBe(true);
  expect(res2.body.data).toBeDefined();

  const customerId = res2.body.data._id;
  const res3 = await request(app).get(`/api/customers/${customerId}`);
  expect(res3.status).toBe(200);
  expect(res3.body.success).toBe(true);
});
