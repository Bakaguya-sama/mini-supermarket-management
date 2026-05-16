/**
 * Unit Tests - ProductBatchService
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const productBatchRepository = require('../repositories/ProductBatchRepository');
const productBatchService = require('../services/ProductBatchService');
const { Product } = require('../models');
const mongoose = require('mongoose');

jest.mock('../repositories/ProductBatchRepository');
jest.mock('../models', () => ({
  Product: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));
jest.mock('../config/redis');
jest.mock('../config/logger');

describe('ProductBatchService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllBatches', () => {
    it('TC01: should query batches with expiry filters', async () => {
      const filters = { expiry_before: '2026-12-31' };
      productBatchRepository.findAll.mockResolvedValue([]);
      productBatchRepository.countDocuments.mockResolvedValue(0);
      
      await productBatchService.getAllBatches(filters);
      
      expect(productBatchRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          expiry_date: expect.objectContaining({ $lte: expect.any(Date) }),
          isDelete: false
        }),
        expect.any(Object)
      );
    });
  });

  describe('createBatch', () => {
    it('TC02: should throw BadRequestError if product_id is missing', async () => {
      await expect(productBatchService.createBatch({ batch_number: 'B1' }))
        .rejects.toThrow(BadRequestError);
    });

    it('TC03: should throw BadRequestError if expiry_date is invalid', async () => {
      Product.findById.mockResolvedValue({ _id: 'p1', isDelete: false });
      await expect(productBatchService.createBatch({ 
        product_id: new mongoose.Types.ObjectId().toString(), 
        batch_number: 'B1',
        expiry_date: 'invalid-date' 
      })).rejects.toThrow(BadRequestError);
    });

    it('TC04: should create batch and return it', async () => {
      const productId = new mongoose.Types.ObjectId().toString();
      const future = new Date(Date.now() + 86400000 * 100);
      const mockBatch = { _id: 'b1', batch_number: 'B1', product_id: productId };
      
      Product.findById.mockResolvedValue({ _id: productId, isDelete: false });
      productBatchRepository.create.mockResolvedValue(mockBatch);
      productBatchRepository.findById.mockResolvedValue(mockBatch);
      
      const result = await productBatchService.createBatch({
        product_id: productId,
        batch_number: 'B1',
        expiry_date: future,
        quantity: 100
      });

      expect(result.batch_number).toBe('B1');
      expect(Product.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('updateBatch', () => {
    it('TC05: should update batch successfully', async () => {
      const batchId = new mongoose.Types.ObjectId().toString();
      const mockBatch = { _id: batchId, status: 'active', product_id: 'p1' };
      productBatchRepository.findById.mockResolvedValue(mockBatch);
      productBatchRepository.save.mockResolvedValue(true);
      productBatchRepository.findById.mockResolvedValue({ ...mockBatch, status: 'expired' });

      const result = await productBatchService.updateBatch(batchId, { status: 'expired' });
      expect(result.status).toBe('expired');
    });

    it('TC06: should throw NotFoundError if batch does not exist', async () => {
      productBatchRepository.findById.mockResolvedValue(null);
      await expect(productBatchService.updateBatch(new mongoose.Types.ObjectId().toString(), { status: 'expired' }))
        .rejects.toThrow(NotFoundError);
    });
  });
});
