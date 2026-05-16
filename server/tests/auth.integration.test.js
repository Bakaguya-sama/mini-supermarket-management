<<<<<<< HEAD
const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, makeTokenForAccount } = require('./testHelper');
const { Account, Customer } = require('../models');
=======
/**
 * Integration Tests - Auth API
 * Tests real HTTP endpoints against an in-memory test MongoDB
 */
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { setupDB, teardownDB, clearCollections, getApp } = require('./testHelper');
const { Account } = require('../models');
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723

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

<<<<<<< HEAD
describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register/customer', () => {
    test('should register a new customer successfully', async () => {
      const payload = {
        username: 'newcustomer',
        email: 'customer@example.com',
        password: 'password123',
        full_name: 'New Customer',
        phone: '0123456789'
      };

      const res = await request(app)
        .post('/api/auth/register/customer')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(payload.email);
      expect(res.body.data.user.role).toBe('customer');
    });

    test('should fail with duplicate email', async () => {
      const payload = {
        username: 'customer1',
        email: 'same@example.com',
        password: 'password123',
        full_name: 'Customer One',
        phone: '0123456789'
      };

      // First registration
      await request(app)
        .post('/api/auth/register/customer')
        .send(payload);

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({ ...payload, username: 'customer2' });

      expect(res.status).toBe(400);
    });

    test('should fail with missing required fields', async () => {
      const payload = {
        username: 'customer1',
        // missing email, password, full_name
      };

      const res = await request(app)
        .post('/api/auth/register/customer')
        .send(payload);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a customer account for testing
      await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          phone: '0123456789'
        });
    });

    test('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('testuser');
    });

    test('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });

    test('should fail with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/verify-token', () => {
    test('should verify valid token', async () => {
      // Register and login to get token
      const registerRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'verifyuser',
          email: 'verify@example.com',
          password: 'password123',
          full_name: 'Verify User',
          phone: '0123456789'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .post('/api/auth/verify-token')
        .send({ token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify-token')
        .send({ token: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user info with valid token', async () => {
      // Register and login
      const registerRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'password123',
          full_name: 'Me User',
          phone: '0123456789'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('me@example.com');
    });

    test('should fail without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    test('should update profile successfully', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'profileuser',
          email: 'profile@example.com',
          password: 'password123',
          full_name: 'Profile User',
          phone: '0123456789'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Updated Name',
          phone: '9876543210'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe('Updated Name');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    test('should change password successfully', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'pwduser',
          email: 'pwd@example.com',
          password: 'oldpassword123',
          full_name: 'Pwd User',
          phone: '0123456789'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'oldpassword123',
          new_password: 'newpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'pwduser',
          password: 'newpassword123'
        });

      expect(loginRes.status).toBe(200);
    });

    test('should fail with wrong old password', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          username: 'wrongpwd',
          email: 'wrongpwd@example.com',
          password: 'correctpassword',
          full_name: 'Wrong Pwd User',
          phone: '0123456789'
        });

      const token = registerRes.body.data.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword123'
        });

      expect(res.status).toBe(401);
    });
  });
=======
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
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723
});
