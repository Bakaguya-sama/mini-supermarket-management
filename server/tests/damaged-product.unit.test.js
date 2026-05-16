/**
 * Unit Tests - DamagedProductService
 * Tests business logic for reporting and resolving damaged products
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const damagedProductService = require('../services/DamagedProductService');
const damagedProductRepository = require('../repositories/DamagedProductRepository');
const redisClient = require('../config/redis');

jest.mock('../repositories/DamagedProductRepository');
jest.mock('../config/redis');
jest.mock('../config/logger');

describe('DamagedProductService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── createDamagedProduct ─────────────────
  describe('createDamagedProduct', () => {
    it('TC01: should throw BadRequestError if product_id is missing', async () => {
      await expect(damagedProductService.createDamagedProduct({ damaged_quantity: 5 }))
        .rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw NotFoundError if product does not exist', async () => {
      damagedProductRepository.findProductById.mockResolvedValue(null);
      await expect(damagedProductService.createDamagedProduct({ product_id: 'p1', damaged_quantity: 5 }))
        .rejects.toThrow(NotFoundError);
    });

    it('TC03: should throw BadRequestError if shelf quantity is insufficient', async () => {
      damagedProductRepository.findProductById.mockResolvedValue({ _id: 'p1', name: 'Milk' });
      damagedProductRepository.findProductShelf.mockResolvedValue({ quantity: 2 }); // only 2 left

      await expect(damagedProductService.createDamagedProduct({ 
        product_id: 'p1', shelf_id: 's1', damaged_quantity: 5 
      })).rejects.toThrow(BadRequestError);
    });

    it('TC04: should create damaged product report and update shelf quantity', async () => {
      const mockProduct = { _id: 'p1', name: 'Milk', unit: 'box' };
      const mockShelf = { _id: 's1', shelf_number: 'A1', current_quantity: 10, save: jest.fn() };
      const mockProductShelf = { _id: 'ps1', quantity: 10, save: jest.fn() };
      
      damagedProductRepository.findProductById.mockResolvedValue(mockProduct);
      damagedProductRepository.findProductShelf.mockResolvedValue(mockProductShelf);
      damagedProductRepository.findShelfById.mockResolvedValue(mockShelf);
      damagedProductRepository.create.mockResolvedValue({ _id: 'dp1' });
      damagedProductRepository.findById.mockResolvedValue({ _id: 'dp1', product_name: 'Milk' });

      const result = await damagedProductService.createDamagedProduct({
        product_id: 'p1', shelf_id: 's1', damaged_quantity: 3
      });

      expect(mockProductShelf.quantity).toBe(7);
      expect(mockShelf.current_quantity).toBe(7);
      expect(damagedProductRepository.create).toHaveBeenCalled();
      expect(result.product_name).toBe('Milk');
    });
  });

  // ───────────────── adjustInventoryForDamaged ─────────────────
  describe('adjustInventoryForDamaged', () => {
    it('TC05: should deduct from warehouse stock and mark resolved', async () => {
      const mockDP = { 
        _id: 'dp1', product_id: 'p1', damaged_quantity: 10, 
        inventory_adjusted: false, status: 'reported' 
      };
      const mockProduct = { _id: 'p1', current_stock: 100, save: jest.fn() };

      damagedProductRepository.findById.mockResolvedValue(mockDP);
      damagedProductRepository.findProductById.mockResolvedValue(mockProduct);
      damagedProductRepository.save.mockResolvedValue(true);

      const result = await damagedProductService.adjustInventoryForDamaged('dp1');

      expect(mockProduct.current_stock).toBe(90);
      expect(result.damagedProduct.status).toBe('resolved');
      expect(result.damagedProduct.inventory_adjusted).toBe(true);
    });

    it('TC06: should throw BadRequestError if already adjusted', async () => {
      damagedProductRepository.findById.mockResolvedValue({ inventory_adjusted: true });
      await expect(damagedProductService.adjustInventoryForDamaged('dp1'))
        .rejects.toThrow(BadRequestError);
    });
  });
});
