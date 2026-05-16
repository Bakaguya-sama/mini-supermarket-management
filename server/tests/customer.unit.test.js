/**
 * Unit Tests - CustomerService
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const customerService = require('../services/CustomerService');
const customerRepository = require('../repositories/CustomerRepository');
const accountRepository = require('../repositories/AccountRepository');
const { Account } = require('../models');
const mongoose = require('mongoose');

jest.mock('../repositories/CustomerRepository');
jest.mock('../repositories/AccountRepository');
jest.mock('../models', () => ({
  Account: { findById: jest.fn() },
  Order: { countDocuments: jest.fn() },
  Cart: { countDocuments: jest.fn() }
}));

describe('CustomerService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── createCustomer ─────────────────
  describe('createCustomer', () => {
    it('TC01: should throw BadRequestError if creating without account info', async () => {
      await expect(customerService.createCustomer({}))
        .rejects.toThrow(BadRequestError);
    });

    it('TC02: should create a new account and customer when account_id is missing', async () => {
      accountRepository.findByUsername.mockResolvedValue(null);
      accountRepository.findByEmail.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue({ _id: 'acc1' });
      customerRepository.findOne.mockResolvedValue(null);
      customerRepository.create.mockResolvedValue({ 
        _id: 'cust1', 
        populate: jest.fn().mockResolvedValue({ _id: 'cust1' }) 
      });

      const result = await customerService.createCustomer({
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User'
      });

      expect(accountRepository.create).toHaveBeenCalled();
      expect(customerRepository.create).toHaveBeenCalledWith(expect.objectContaining({ account_id: 'acc1' }));
    });

    it('TC03: should throw NotFoundError if provided account_id does not exist', async () => {
      Account.findById.mockResolvedValue(null);
      await expect(customerService.createCustomer({ account_id: new mongoose.Types.ObjectId().toString() }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ───────────────── updatePoints ─────────────────
  describe('updatePoints', () => {
    it('TC04: should increment points balance', async () => {
      const customerId = new mongoose.Types.ObjectId().toString();
      customerRepository.findByIdAndUpdate.mockResolvedValue({ _id: customerId, points_balance: 100 });

      const result = await customerService.updatePoints(customerId, 100);
      expect(customerRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        customerId,
        { $inc: { points_balance: 100 } },
        { new: true }
      );
      expect(result.points_balance).toBe(100);
    });
  });
});
