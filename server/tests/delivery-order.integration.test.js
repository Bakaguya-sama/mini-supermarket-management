const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, makeTokenForAccount, models } = require('./testHelper');
const { Account, Staff, Product, Cart, CartItem, Order } = require('../models');

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

test('POST /api/delivery-orders creates delivery for existing order', async () => {
  // create staff account and staff doc
  const staffAcc = await Account.create({ username: 'staff1', email: 'staff1@example.com', role: 'staff', full_name: 'Staff One' });
  const staff = await models.Staff.create({ account_id: staffAcc._id, position: 'Delivery' });
  const token = makeTokenForAccount(staffAcc);

  // create account + customer
  const custAcc = await Account.create({ username: 'c2', email: 'c2@example.com', role: 'customer', full_name: 'C2' });
  const customer = await models.Customer.create({ account_id: custAcc._id });

  // create product
  const product = await Product.create({ name: 'Banana', unit: 'pcs', price: 500 });

  // create cart and cartItem
  const cart = await Cart.create({ customer_id: customer._id, subtotal: 500, total: 500 });
  const cartItem = await CartItem.create({ cart_id: cart._id, product_id: product._id, quantity: 1, unit_price: 500, line_total: 500 });
  cart.cartItems.push(cartItem._id);
  await cart.save();

  // create order via API (from cart)
  const orderRes = await request(app)
    .post('/api/orders')
    .send({ customer_id: customer._id, cart_id: cart._id });

  expect(orderRes.status).toBe(201);
  const orderId = orderRes.body.data._id;

  // create delivery order
  const res = await request(app)
    .post('/api/delivery-orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ order_id: orderId, staff_id: staff._id });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.order_id).toBeDefined();
});
