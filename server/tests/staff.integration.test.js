const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');

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

test('POST /api/staff creates staff and GET /api/staff returns it', async () => {
  const payload = { username: 'staff_new', email: 'staff_new@example.com', full_name: 'Staff New', position: 'Delivery', password: 'password123' };
  const res1 = await request(app).post('/api/staff').send(payload);
  expect(res1.status).toBe(201);
  expect(res1.body.success).toBe(true);

  const res2 = await request(app).get('/api/staff');
  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
  expect(res2.body.count).toBeGreaterThanOrEqual(1);
});
