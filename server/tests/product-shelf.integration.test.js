/**
 * Integration Tests - ProductShelf API
 */
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
const { Product, Shelf, ProductShelf } = require('../models');

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

test('TC01: POST /api/product-shelves - assigns product to shelf', async () => {
  const product = await Product.create({ name: 'Bread', unit: 'pcs', price: 10000, current_stock: 100 });
  const shelf = await Shelf.create({ shelf_number: 'B1', shelf_name: 'B', section_number: 1, capacity: 20 });

  const res = await request(app)
    .post('/api/product-shelves')
    .send({
      product_id: product._id,
      shelf_id: shelf._id,
      quantity: 5
    });

  expect(res.status).toBe(201);
  expect(res.body.data.quantity).toBe(5);
  
  const shelfUpdate = await Shelf.findById(shelf._id);
  expect(shelfUpdate.current_quantity).toBe(5);
});

test('TC02: GET /api/product-shelves/product/:id - returns all shelves for a product', async () => {
  const product = await Product.create({ name: 'Milk', unit: 'box' });
  const shelf1 = await Shelf.create({ shelf_number: 'S1', shelf_name: 'S', section_number: 1 });
  const shelf2 = await Shelf.create({ shelf_number: 'S2', shelf_name: 'S', section_number: 1 });
  
  await ProductShelf.create({ product_id: product._id, shelf_id: shelf1._id, quantity: 5 });
  await ProductShelf.create({ product_id: product._id, shelf_id: shelf2._id, quantity: 10 });

  const res = await request(app).get(`/api/product-shelves/product/${product._id}/shelves`);
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(2);
});

test('TC03: PATCH /api/product-shelves/:id/move - moves quantity between shelves', async () => {
  const product = await Product.create({ name: 'Soda', unit: 'can' });
  const shelfFrom = await Shelf.create({ shelf_number: 'F1', shelf_name: 'F', section_number: 1, capacity: 50, current_quantity: 20 });
  const shelfTo = await Shelf.create({ shelf_number: 'T1', shelf_name: 'T', section_number: 1, capacity: 50, current_quantity: 0 });
  
  const psFrom = await ProductShelf.create({ product_id: product._id, shelf_id: shelfFrom._id, quantity: 20 });

  const res = await request(app)
    .put(`/api/product-shelves/${psFrom._id}/move`)
    .send({
      target_shelf_id: shelfTo._id,
      quantity: 15
    });

  expect(res.status).toBe(200);
  
  const psFromUpdate = await ProductShelf.findById(psFrom._id);
  expect(psFromUpdate.quantity).toBe(5);
  
  const psTo = await ProductShelf.findOne({ shelf_id: shelfTo._id, product_id: product._id });
  expect(psTo.quantity).toBe(15);
});
