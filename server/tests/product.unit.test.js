/**
 * Unit Tests - ProductService
 */
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const productService = require('../services/ProductService');
const productRepository = require('../repositories/ProductRepository');
const { Supplier, ProductBatch } = require('../models');
const mongoose = require('mongoose');

jest.mock('../repositories/ProductRepository');
jest.mock('../config/redis');
jest.mock('../config/logger');
jest.mock('../models', () => ({
  Supplier: { findById: jest.fn() },
  ProductBatch: { create: jest.fn() }
}));

describe('ProductService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── createProduct ─────────────────
  describe('createProduct', () => {
    it('TC01: should throw BadRequestError if name is missing', async () => {
      await expect(productService.createProduct({ unit: 'kg' }))
        .rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw ConflictError if product name exists', async () => {
      productRepository.findOne.mockResolvedValue({ name: 'Milk' });
      await expect(productService.createProduct({ name: 'Milk', unit: 'box' }))
        .rejects.toThrow(ConflictError);
    });

    it('TC03: should create product successfully', async () => {
      const supplierId = new mongoose.Types.ObjectId().toString();
      Supplier.findById.mockResolvedValue({ _id: supplierId });
      productRepository.findOne.mockResolvedValue(null);
      productRepository.create.mockResolvedValue({ 
        _id: 'p1', 
        name: 'Milk',
        populate: jest.fn().mockResolvedValue({ _id: 'p1' }) 
      });

      const result = await productService.createProduct({
        name: 'Milk',
        unit: 'box',
        supplier_id: supplierId,
        price: 15000
      });

      expect(productRepository.create).toHaveBeenCalled();
      expect(result._id).toBe('p1');
    });
  });

  // ───────────────── updateProduct ─────────────────
  describe('updateProduct', () => {
    it('TC04: should create a restock batch if restockBatch data is provided', async () => {
      const productId = new mongoose.Types.ObjectId().toString();
      const mockProduct = { 
        _id: productId, 
        save: jest.fn(), 
        populate: jest.fn().mockResolvedValue({ _id: productId }) 
      };
      
      productRepository.findById.mockResolvedValue(mockProduct);
      ProductBatch.create.mockResolvedValue({ _id: 'batch1' });
      productRepository.findByIdAndUpdate.mockResolvedValue(mockProduct);

      const result = await productService.updateProduct(productId, {
        restockBatch: { quantity: 50, expiry_date: '2027-01-01' }
      });

      expect(ProductBatch.create).toHaveBeenCalled();
      expect(productRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        { $inc: { current_stock: 50 } }
      );
    });
  });

  // ───────────────── updateProductStock ─────────────────
  describe('updateProductStock', () => {
    it('TC05: should add stock via adjustment', async () => {
      const mockProduct = { _id: 'p1', current_stock: 10 };
      productRepository.findById.mockResolvedValue(mockProduct);

      await productService.updateProductStock('p1', { adjustment_type: 'add', adjustment_value: 5 });
      expect(mockProduct.current_stock).toBe(15);
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('TC06: should cap stock at 0 on subtraction', async () => {
      const mockProduct = { _id: 'p1', current_stock: 10 };
      productRepository.findById.mockResolvedValue(mockProduct);

      await productService.updateProductStock('p1', { adjustment_type: 'subtract', adjustment_value: 20 });
      expect(mockProduct.current_stock).toBe(0);
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });
});
