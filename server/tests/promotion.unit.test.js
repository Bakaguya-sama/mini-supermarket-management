/**
 * Unit Tests - PromotionService
 * Tests business logic for promotions and promo code validation
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const promotionService = require('../services/PromotionService');
const promotionRepository = require('../repositories/PromotionRepository');
const redisClient = require('../config/redis');

jest.mock('../repositories/PromotionRepository');
jest.mock('../config/redis');

describe('PromotionService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── validatePromoCode ─────────────────
  describe('validatePromoCode', () => {
    it('TC01: should throw BadRequestError if no code provided', async () => {
      await expect(promotionService.validatePromoCode(null, 100000))
        .rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw NotFoundError if code does not exist', async () => {
      promotionRepository.findOne.mockResolvedValue(null);
      await expect(promotionService.validatePromoCode('INVALID', 100000))
        .rejects.toThrow(NotFoundError);
    });

    it('TC03: should throw BadRequestError if promotion has not started', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      
      promotionRepository.findOne.mockResolvedValue({
        promo_code: 'FUTURE',
        start_date: future,
        end_date: new Date(future.getTime() + 86400000),
        isDelete: false
      });

      await expect(promotionService.validatePromoCode('FUTURE', 100000))
        .rejects.toThrow(BadRequestError);
    });

    it('TC04: should calculate percentage discount correctly', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const tomorrow = new Date(now.getTime() + 86400000);

      promotionRepository.findOne.mockResolvedValue({
        promo_code: 'OFF10',
        start_date: yesterday,
        end_date: tomorrow,
        promotion_type: 'percentage',
        discount_value: 10,
        minimum_purchase_amount: 50000,
        max_discount_amount: 5000,
        isDelete: false
      });

      const result = await promotionService.validatePromoCode('OFF10', 100000);
      expect(result.isValid).toBe(true);
      expect(result.discount_amount).toBe(5000); // 10% of 100k is 10k, but capped at 5k
      expect(result.final_total).toBe(95000);
    });

    it('TC05: should calculate fixed amount discount correctly', async () => {
      const now = new Date();
      promotionRepository.findOne.mockResolvedValue({
        promo_code: 'FIXED',
        start_date: new Date(now.getTime() - 86400000),
        end_date: new Date(now.getTime() + 86400000),
        promotion_type: 'fixed_amount',
        discount_value: 20000,
        minimum_purchase_amount: 0,
        isDelete: false
      });

      const result = await promotionService.validatePromoCode('FIXED', 50000);
      expect(result.discount_amount).toBe(20000);
      expect(result.final_total).toBe(30000);
    });

    it('TC06: should throw BadRequestError if subtotal < min_purchase_amount', async () => {
      const now = new Date();
      promotionRepository.findOne.mockResolvedValue({
        promo_code: 'MIN100',
        start_date: new Date(now.getTime() - 86400000),
        end_date: new Date(now.getTime() + 86400000),
        minimum_purchase_amount: 100000,
        isDelete: false
      });

      await expect(promotionService.validatePromoCode('MIN100', 50000))
        .rejects.toThrow(BadRequestError);
    });
  });
});
