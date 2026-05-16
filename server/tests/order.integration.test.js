const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, models } = require('./testHelper');
const { Account, Product, Cart, CartItem } = require('../models');

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

test('TC01: POST /api/orders creates order from cart successfully', async () => {
  const acc = await Account.create({ username: 'ord1', email: 'ord1@example.com', role: 'customer', full_name: 'Ord1' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const product = await Product.create({ name: 'Soap', unit: 'pcs', price: 5000, current_stock: 10 });
  const cart = await Cart.create({ customer_id: customer._id, subtotal: 5000, total: 5000 });
  const cartItem = await CartItem.create({ cart_id: cart._id, product_id: product._id, quantity: 1, unit_price: 5000, line_total: 5000 });
  cart.cartItems.push(cartItem._id);
  await cart.save();

  const res = await request(app)
    .post('/api/orders')
    .send({ customer_id: customer._id, cart_id: cart._id });
    
  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.order_number).toBeDefined();
});

test('TC02: GET /api/orders/:id returns the created order', async () => {
  const acc = await Account.create({ username: 'ord2', email: 'ord2@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const order = await models.Order.create({ order_number: 'ORD-TEST-1', customer_id: customer._id, total_amount: 10000 });

  const res = await request(app).get(`/api/orders/${order._id}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.order_number).toBe('ORD-TEST-1');
});

test('TC03: GET /api/orders/customer/:customerId returns orders list for customer', async () => {
  const acc = await Account.create({ username: 'ord3', email: 'ord3@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  await models.Order.create({ order_number: 'ORD-TEST-2', customer_id: customer._id, total_amount: 15000 });

  const res = await request(app).get(`/api/orders/customer/${customer._id}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.length).toBeGreaterThan(0);
  expect(res.body.data[0].order_number).toBe('ORD-TEST-2');
});

test('TC04: PUT /api/orders/:id updates order status', async () => {
  const acc = await Account.create({ username: 'ord4', email: 'ord4@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const order = await models.Order.create({ order_number: 'ORD-TEST-3', customer_id: customer._id, total_amount: 20000, status: 'pending' });

  const res = await request(app)
    .put(`/api/orders/${order._id}`)
    .send({ status: 'confirmed' });
    
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.status).toBe('confirmed');
});

test('TC05: PATCH /api/orders/:id/cancel cancels the order if pending', async () => {
  const acc = await Account.create({ username: 'ord5', email: 'ord5@example.com', role: 'customer' });
  const customer = await models.Customer.create({ account_id: acc._id });
  const order = await models.Order.create({ order_number: 'ORD-TEST-4', customer_id: customer._id, total_amount: 25000, status: 'pending' });

  const res = await request(app).patch(`/api/orders/${order._id}/cancel`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.status).toBe('cancelled');
});
