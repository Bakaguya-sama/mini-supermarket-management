// server/services/PromotionService.js
const promotionRepository = require('../repositories/PromotionRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const redisClient = require('../config/redis');

const CACHE_TTL = 600; // 10 minutes

class PromotionService {
  async getAllPromotions({ status, search }) {
    const query = { isDelete: false };
    const now = new Date();

    if (status === 'active') {
      query.start_date = { $lte: now };
      query.end_date = { $gte: now };
    } else if (status === 'upcoming') {
      query.start_date = { $gt: now };
    } else if (status === 'expired') {
      query.end_date = { $lt: now };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    return await promotionRepository.findAll(query);
  }

  async getPromotionById(id) {
    const cacheKey = `promotion:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const promotion = await promotionRepository.findById(id);
    if (!promotion) throw new NotFoundError('Promotion not found');

    const products = await promotionRepository.getPromotionProducts(id);
    const result = { ...promotion, applied_products: products };
    
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async validatePromoCode(code, subtotal) {
    if (!code) throw new BadRequestError('Vui lòng nhập mã khuyến mãi');

    const promotion = await promotionRepository.findOne({ code, isDelete: false });
    if (!promotion) throw new NotFoundError('Mã khuyến mãi không tồn tại');

    const now = new Date();
    if (new Date(promotion.start_date) > now) throw new BadRequestError('Mã khuyến mãi chưa bắt đầu áp dụng');
    if (new Date(promotion.end_date) < now) throw new BadRequestError('Mã khuyến mãi đã hết hạn');

    if (subtotal !== undefined && promotion.min_purchase_amount > 0 && subtotal < promotion.min_purchase_amount) {
      throw new BadRequestError(`Đơn hàng cần đạt tối thiểu ${promotion.min_purchase_amount} để áp dụng mã này`);
    }

    let discountAmount = 0;
    if (promotion.discount_type === 'percentage') {
      discountAmount = (subtotal * promotion.discount_value) / 100;
      if (promotion.max_discount_amount && discountAmount > promotion.max_discount_amount) {
        discountAmount = promotion.max_discount_amount;
      }
    } else if (promotion.discount_type === 'fixed_amount') {
      discountAmount = promotion.discount_value;
    }

    return {
      isValid: true,
      promotion,
      discount_amount: discountAmount,
      final_total: Math.max(0, subtotal - discountAmount)
    };
  }

  async getApplicablePromotions(subtotal) {
    const now = new Date();
    const query = {
      isDelete: false,
      start_date: { $lte: now },
      end_date: { $gte: now }
    };
    
    if (subtotal !== undefined) {
      query.min_purchase_amount = { $lte: subtotal };
    }

    return await promotionRepository.findAll(query);
  }

  async createPromotion(data) {
    const promotion = await promotionRepository.create(data);
    await redisClient.del('promotions:all'); // Invalidate cache if needed
    return promotion;
  }

  async updatePromotion(id, data) {
    const promotion = await promotionRepository.update(id, data);
    if (!promotion) throw new NotFoundError('Promotion not found');
    await redisClient.del(`promotion:${id}`);
    return promotion;
  }

  async deletePromotion(id) {
    const promotion = await promotionRepository.update(id, { isDelete: true });
    if (!promotion) throw new NotFoundError('Promotion not found');
    await redisClient.del(`promotion:${id}`);
    return promotion;
  }
}

module.exports = new PromotionService();
