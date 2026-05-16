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

const makeInvoicePayload = (customerId, productId) => ({
  customer_id: customerId,
  items: [{ product_id: productId, quantity: 2, unit_price: 20000 }]
});

test('TC01: POST /api/invoices - creates an invoice successfully', async () => {
  const acc = await Account.create({ username: 'inv1', email: 'inv1@example.com', role: 'customer', full_name: 'Inv1' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const product = await Product.create({ name: 'Milk', unit: 'box', price: 20000 });

  const res = await request(app).post('/api/invoices').send(makeInvoicePayload(customer._id, product._id));

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.invoice_number).toMatch(/^INV-/);
});

test('TC02: GET /api/invoices/:id - returns invoice by ID', async () => {
  const acc = await Account.create({ username: 'inv2', email: 'inv2@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const product = await Product.create({ name: 'Water', unit: 'bottle', price: 10000 });

  const createRes = await request(app).post('/api/invoices').send(makeInvoicePayload(customer._id, product._id));
  const invoiceId = createRes.body.data._id;

  const res = await request(app).get(`/api/invoices/${invoiceId}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data._id).toBe(invoiceId);
});

test('TC03: GET /api/invoices - returns paginated list of invoices', async () => {
  const acc = await Account.create({ username: 'inv3', email: 'inv3@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const product = await Product.create({ name: 'Bread', unit: 'loaf', price: 15000 });

  await request(app).post('/api/invoices').send(makeInvoicePayload(customer._id, product._id));

  const res = await request(app).get('/api/invoices');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.length).toBeGreaterThan(0);
});

test('TC04: GET /api/invoices?payment_status=unpaid - filters correctly', async () => {
  const acc = await Account.create({ username: 'inv4', email: 'inv4@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const product = await Product.create({ name: 'Juice', unit: 'can', price: 12000 });

  await request(app).post('/api/invoices').send(makeInvoicePayload(customer._id, product._id));

  const res = await request(app).get('/api/invoices?payment_status=unpaid');
  expect(res.status).toBe(200);
  expect(res.body.data.every(inv => inv.payment_status === 'unpaid')).toBe(true);
});

test('TC05: GET /api/invoices/:id - returns 404 for non-existent ID', async () => {
  const res = await request(app).get('/api/invoices/6a07c4eaf692dbc454a1ffff');
  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});

test('TC06: POST /api/invoices - returns 400 when items list is empty', async () => {
  const acc = await Account.create({ username: 'inv6', email: 'inv6@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const res = await request(app).post('/api/invoices').send({ customer_id: customer._id, items: [] });
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});
