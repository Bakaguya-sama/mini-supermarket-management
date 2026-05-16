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

test('POST /api/orders creates order from cart and GET /api/orders returns it', async () => {
  const acc = await Account.create({ username: 'ord1', email: 'ord1@example.com', role: 'customer', full_name: 'Ord1' });
  const customer = await models.Customer.create({ account_id: acc._id });

  const product = await Product.create({ name: 'Soap', unit: 'pcs', price: 5000 });
  const cart = await Cart.create({ customer_id: customer._id, subtotal: 5000, total: 5000 });
  const cartItem = await CartItem.create({ cart_id: cart._id, product_id: product._id, quantity: 1, unit_price: 5000, line_total: 5000 });
  cart.cartItems.push(cartItem._id);
  await cart.save();

  const res1 = await request(app).post('/api/orders').send({ customer_id: customer._id, cart_id: cart._id });
  expect(res1.status).toBe(201);
  expect(res1.body.success).toBe(true);
  const orderId = res1.body.data._id;

  const res2 = await request(app).get(`/api/orders/${orderId}`);
  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
});
