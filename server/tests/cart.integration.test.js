const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, createAccount, models, makeTokenForAccount } = require('./testHelper');
const { Product, Cart, CartItem, Customer, Account } = require('../models');

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

test('GET /api/carts/customer/:customerId auto-creates cart and POST add item works', async () => {
  // create account + customer
  const account = await Account.create({ username: 'c1', email: 'c1@example.com', role: 'customer', full_name: 'C1' });
  const customer = await models.Customer.create({ account_id: account._id });

  // GET should auto-create cart
  const res1 = await request(app).get(`/api/carts/customer/${customer._id}`);
  expect(res1.status).toBe(200);
  expect(res1.body.success).toBe(true);
  const cart = res1.body.data;
  expect(cart.customer_id).toBeDefined();

  // create product
  const product = await Product.create({ name: 'Apple', unit: 'pcs', price: 1000 });

  // POST add item to cart
  const res2 = await request(app)
    .post(`/api/carts/${cart._id}/items`)
    .send({ product_id: product._id, quantity: 2 });

  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
  expect(res2.body.data.cartItems.length).toBeGreaterThan(0);

  // GET cart by id
  const res3 = await request(app).get(`/api/carts/${cart._id}`);
  expect(res3.status).toBe(200);
  expect(res3.body.success).toBe(true);
  expect(res3.body.data.total).toBeGreaterThanOrEqual(0);
});
