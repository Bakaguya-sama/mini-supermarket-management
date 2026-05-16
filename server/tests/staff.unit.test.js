/**
 * Unit Tests - StaffService
 * Tests staff business logic with mocked repositories
 */
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const mongoose = require('mongoose');

jest.mock('../repositories/StaffRepository');
jest.mock('../models', () => ({
  Staff: { create: jest.fn(), findByIdAndDelete: jest.fn() },
  Account: { findOne: jest.fn(), create: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() }
}));

const staffRepository = require('../repositories/StaffRepository');
const staffService = require('../services/StaffService');

describe('StaffService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── getStaffById ─────────────────
  describe('getStaffById', () => {
    it('TC01: should throw BadRequestError for invalid ObjectId format', async () => {
      await expect(staffService.getStaffById('not-an-id')).rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw NotFoundError when staff does not exist', async () => {
      staffRepository.findById.mockResolvedValue(null);
      const validId = new mongoose.Types.ObjectId().toString();
      await expect(staffService.getStaffById(validId)).rejects.toThrow(NotFoundError);
    });

    it('TC03: should return staff when found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockStaff = { _id: validId, position: 'Cashier', is_active: true };
      staffRepository.findById.mockResolvedValue(mockStaff);

      const result = await staffService.getStaffById(validId);
      expect(result).toEqual(mockStaff);
    });
  });

  // ───────────────── createStaff ─────────────────
  describe('createStaff', () => {
    it('TC04: should throw BadRequestError if required fields are missing', async () => {
      await expect(staffService.createStaff({ username: 'only_name' }))
        .rejects.toThrow(BadRequestError);
    });

    it('TC05: should throw ConflictError if username or email already exists', async () => {
      const { Account } = require('../models');
      Account.findOne.mockResolvedValue({ _id: 'existing-id' });

      await expect(staffService.createStaff({
        username: 'existed', password: 'pass123', email: 'existed@x.com', position: 'Cashier'
      })).rejects.toThrow(ConflictError);
    });
  });

  // ───────────────── deleteStaff ─────────────────
  describe('deleteStaff', () => {
    it('TC06: should soft-delete staff and return the deleted record', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockStaff = { _id: validId, position: 'Delivery', account_id: new mongoose.Types.ObjectId() };
      staffRepository.findById.mockResolvedValue(mockStaff);
      staffRepository.findByIdAndSoftDelete.mockResolvedValue({ ...mockStaff, isDelete: true });

      const { Account } = require('../models');
      Account.findByIdAndUpdate.mockResolvedValue({});

      const result = await staffService.deleteStaff(validId);
      expect(result.isDelete).toBe(true);
      expect(staffRepository.findByIdAndSoftDelete).toHaveBeenCalledWith(validId);
    });
  });
});
