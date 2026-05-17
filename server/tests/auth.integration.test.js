const request = require('supertest');
const { setupDB, teardownDB, clearCollections, getApp, makeTokenForAccount } = require('./testHelper');
const { Account, Customer } = require('../models');

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
      expect(res.body.data.user.email).toBe('me@example.com');
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
      expect(res.body.data.user.full_name).toBe('Updated Name');
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
});
