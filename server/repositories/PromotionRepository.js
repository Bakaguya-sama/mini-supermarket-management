// server/repositories/PromotionRepository.js
const { Promotion, PromotionProduct } = require('../models');

class PromotionRepository {
  async findAll(query, { sort = '-start_date' } = {}) {
    return await Promotion.find(query).sort(sort).lean();
  }

  async findById(id) {
    return await Promotion.findOne({ _id: id, isDelete: false }).lean();
  }

  async findOne(query) {
    return await Promotion.findOne(query).lean();
  }

  async getPromotionProducts(promotionId) {
    return await PromotionProduct.find({ promotion_id: promotionId, isDelete: false })
      .populate('product_id').lean();
  }
}

module.exports = new PromotionRepository();
