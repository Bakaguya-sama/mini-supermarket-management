/**
 * Unit Tests - ProductStockService
 * Tests business logic for stock tracking and alerts
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const productStockService = require('../services/ProductStockService');
const productStockRepository = require('../repositories/ProductStockRepository');
const mongoose = require('mongoose');

jest.mock('../repositories/ProductStockRepository');
jest.mock('../config/redis');
jest.mock('../config/logger');

describe('ProductStockService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── getLowStockProducts ─────────────────
  describe('getLowStockProducts', () => {
    it('TC01: should query products with low_stock status', async () => {
      productStockRepository.findAll.mockResolvedValue([]);
      await productStockService.getLowStockProducts();
      expect(productStockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'low_stock' }),
        expect.any(Object)
      );
    });
  });

  // ───────────────── adjustStockQuantity ─────────────────
  describe('adjustStockQuantity', () => {
    it('TC02: should throw BadRequestError if adjustment is zero', async () => {
      await expect(productStockService.adjustStockQuantity('id1', 0))
        .rejects.toThrow(BadRequestError);
    });

    it('TC03: should adjust quantity and return details', async () => {
      const stockId = new mongoose.Types.ObjectId().toString();
      const mockStock = { _id: stockId, quantity: 10, toObject: () => ({ _id: stockId, quantity: 15 }) };
      
      productStockRepository.findRaw.mockResolvedValue(mockStock);
      productStockRepository.save.mockResolvedValue(true);
      productStockRepository.findById.mockResolvedValue(mockStock);

      const result = await productStockService.adjustStockQuantity(stockId, 5, 'Restock');
      
      expect(mockStock.quantity).toBe(15);
      expect(result.adjustment_info.old_quantity).toBe(10);
      expect(result.adjustment_info.new_quantity).toBe(15);
    });

    it('TC04: should cap resulting quantity at 0', async () => {
      const stockId = new mongoose.Types.ObjectId().toString();
      const mockStock = { _id: stockId, quantity: 10, toObject: () => ({ _id: stockId, quantity: 0 }) };
      
      productStockRepository.findRaw.mockResolvedValue(mockStock);
      productStockRepository.save.mockResolvedValue(true);
      productStockRepository.findById.mockResolvedValue(mockStock);

      const result = await productStockService.adjustStockQuantity(stockId, -15, 'Damage');
      
      expect(mockStock.quantity).toBe(0);
      expect(result.adjustment_info.new_quantity).toBe(0);
    });
  });

  // ───────────────── createProductStock ─────────────────
  describe('createProductStock', () => {
    it('TC05: should throw NotFoundError if product not found', async () => {
      productStockRepository.findProduct.mockResolvedValue(null);
      await expect(productStockService.createProductStock({ product_id: 'p1' }))
        .rejects.toThrow(NotFoundError);
    });

    it('TC06: should create stock record when product exists', async () => {
      const productId = new mongoose.Types.ObjectId().toString();
      productStockRepository.findProduct.mockResolvedValue({ _id: productId });
      productStockRepository.create.mockResolvedValue({ _id: 'ps1' });
      productStockRepository.findById.mockResolvedValue({ _id: 'ps1', quantity: 10 });

      const result = await productStockService.createProductStock({ product_id: productId, quantity: 10 });
      expect(result._id).toBe('ps1');
      expect(productStockRepository.create).toHaveBeenCalled();
    });
  });
});
