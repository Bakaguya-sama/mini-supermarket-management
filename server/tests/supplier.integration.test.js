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

test('POST /api/suppliers creates supplier and GET /api/suppliers returns it', async () => {
  const payload = { name: 'Supplier A', email: 'supA@example.com', phone: '0123456789' };
  const res1 = await request(app).post('/api/suppliers').send(payload);
  expect(res1.status).toBe(201);
  expect(res1.body.success).toBe(true);

  const res2 = await request(app).get('/api/suppliers');
  expect(res2.status).toBe(200);
  expect(res2.body.success).toBe(true);
});
