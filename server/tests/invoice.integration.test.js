const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
const { Account, Product } = require('../models');

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

test('POST /api/invoices creates invoice and GET /api/invoices returns it', async () => {
  const acc = await Account.create({ username: 'inv1', email: 'inv1@example.com', role: 'customer', full_name: 'Inv1' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const product = await Product.create({ name: 'Milk', unit: 'box', price: 20000 });

  const payload = {
    customer_id: customer._id,
    items: [{ product_id: product._id, quantity: 2, unit_price: 20000 }]
  };

  const res1 = await request(app).post('/api/invoices').send(payload);
  expect(res1.status).toBe(201);
  expect(res1.body.success).toBe(true);
  const invoiceId = res1.body.data._id;

  const res2 = await request(app).get(`/api/invoices/${invoiceId}`);
  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
});
