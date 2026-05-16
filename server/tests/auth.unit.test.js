/**
 * Unit Tests - AuthService
 * Tests core auth business logic in isolation using mocked repositories
 */
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../middleware/errorClasses');

jest.mock('../repositories/AccountRepository');
jest.mock('../repositories/CustomerRepository');
jest.mock('../repositories/StaffRepository');
jest.mock('../repositories/ManagerRepository');

const accountRepository = require('../repositories/AccountRepository');
const customerRepository = require('../repositories/CustomerRepository');
const authService = require('../services/AuthService');

describe('AuthService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── generateToken / verifyToken ─────────────────
  describe('generateToken & verifyToken', () => {
    it('TC01: should generate a valid JWT and verify it back', () => {
      const token = authService.generateToken('user-id-123', 'customer', 'test@x.com');
      expect(typeof token).toBe('string');

      const decoded = authService.verifyToken(token);
      expect(decoded.id).toBe('user-id-123');
      expect(decoded.role).toBe('customer');
      expect(decoded.email).toBe('test@x.com');
    });

    it('TC02: should throw BadRequestError when verifying with no token', () => {
      expect(() => authService.verifyToken(null)).toThrow(BadRequestError);
    });

    it('TC03: should throw UnauthorizedError for a tampered token', () => {
      expect(() => authService.verifyToken('this.is.not.valid')).toThrow(UnauthorizedError);
    });
  });

  // ───────────────── hashPassword / comparePassword ─────────────────
  describe('hashPassword & comparePassword', () => {
    it('TC04: should hash a password and confirm match correctly', async () => {
      const plain = 'mySecret123';
      const hashed = await authService.hashPassword(plain);

      expect(hashed).not.toBe(plain);
      const match = await authService.comparePassword(plain, hashed);
      expect(match).toBe(true);
    });

    it('TC05: should return false when comparing with wrong password', async () => {
      const hashed = await authService.hashPassword('correctPass');
      const match = await authService.comparePassword('wrongPass', hashed);
      expect(match).toBe(false);
    });
  });

  // ───────────────── login ─────────────────
  describe('login', () => {
    it('TC06: should throw UnauthorizedError when account is not found', async () => {
      accountRepository.findByUsername.mockResolvedValue(null);
      await expect(authService.login('unknownUser', 'pass')).rejects.toThrow(UnauthorizedError);
    });
  });
});
