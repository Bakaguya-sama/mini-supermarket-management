/**
 * Integration Tests - Auth API
 * Tests real HTTP endpoints against an in-memory test MongoDB
 */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
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

test('TC01: POST /api/auth/register/customer - registers successfully', async () => {
  const res = await request(app)
    .post('/api/auth/register/customer')
    .send({ username: 'newcust', email: 'newcust@example.com', password: 'pass123', full_name: 'New Cust' });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.token).toBeDefined();
  expect(res.body.data.user.role).toBe('customer');
});

test('TC02: POST /api/auth/register/customer - rejects duplicate username', async () => {
  await Account.create({ username: 'dupuser', email: 'dup@example.com', role: 'customer', password_hash: 'x' });

  const res = await request(app)
    .post('/api/auth/register/customer')
    .send({ username: 'dupuser', email: 'dup2@example.com', password: 'pass123' });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test('TC03: POST /api/auth/login - logs in with valid credentials', async () => {
  const hash = await bcrypt.hash('password123', 10);
  await Account.create({ username: 'loginuser', email: 'login@example.com', role: 'customer', password_hash: hash, is_active: true });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'loginuser', password: 'password123' });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.token).toBeDefined();
});

test('TC04: POST /api/auth/login - rejects wrong password', async () => {
  const hash = await bcrypt.hash('correctPassword', 10);
  await Account.create({ username: 'user2', email: 'user2@example.com', role: 'customer', password_hash: hash });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'user2', password: 'wrongPassword' });

  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
});

test('TC05: GET /api/auth/me - returns 401 without token', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.status).toBe(401);
});

test('TC06: GET /api/auth/me - returns profile with valid token', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register/customer')
    .send({ username: 'profileuser', email: 'profile@example.com', password: 'pass123', full_name: 'Profile User' });

  const token = registerRes.body.data?.token;
  expect(token).toBeDefined();

  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.data.user.username).toBe('profileuser');
});
