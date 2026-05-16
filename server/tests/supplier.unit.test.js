/**
 * Unit Tests - SupplierService
 */
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const supplierService = require('../services/SupplierService');
const supplierRepository = require('../repositories/SupplierRepository');
const mongoose = require('mongoose');

jest.mock('../repositories/SupplierRepository');
jest.mock('../config/logger');

describe('SupplierService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── createSupplier ─────────────────
  describe('createSupplier', () => {
    it('TC01: should throw ConflictError if supplier name already exists', async () => {
      supplierRepository.findByName.mockResolvedValue({ name: 'Coca Cola' });
      await expect(supplierService.createSupplier({ name: 'Coca Cola' }))
        .rejects.toThrow(ConflictError);
    });

    it('TC02: should create supplier successfully', async () => {
      supplierRepository.findByName.mockResolvedValue(null);
      supplierRepository.create.mockResolvedValue({ _id: 's1', name: 'Pepsi' });

      const result = await supplierService.createSupplier({ name: 'Pepsi' });
      expect(result.name).toBe('Pepsi');
      expect(supplierRepository.create).toHaveBeenCalled();
    });
  });

  // ───────────────── deleteSupplier ─────────────────
  describe('deleteSupplier', () => {
    it('TC03: should throw ConflictError if supplier has active products', async () => {
      const supplierId = new mongoose.Types.ObjectId().toString();
      supplierRepository.findById.mockResolvedValue({ _id: supplierId });
      supplierRepository.countProductsBySupplier.mockResolvedValue(5); // 5 active products

      await expect(supplierService.deleteSupplier(supplierId))
        .rejects.toThrow(ConflictError);
    });

    it('TC04: should soft delete if no active products', async () => {
      const supplierId = new mongoose.Types.ObjectId().toString();
      supplierRepository.findById.mockResolvedValue({ _id: supplierId, name: 'Empty Supplier' });
      supplierRepository.countProductsBySupplier.mockResolvedValue(0);
      supplierRepository.findByIdAndSoftDelete.mockResolvedValue({ _id: supplierId, isDelete: true });

      const result = await supplierService.deleteSupplier(supplierId);
      expect(supplierRepository.findByIdAndSoftDelete).toHaveBeenCalledWith(supplierId);
    });
  });
});
