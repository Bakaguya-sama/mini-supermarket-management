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

  async create(data) {
    const promotion = new Promotion(data);
    return await promotion.save();
  }

  async update(id, data) {
    return await Promotion.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await Promotion.findByIdAndUpdate(id, { isDelete: true }, { new: true }).lean();
  }

  async deleteById(id) {
    return await Promotion.findByIdAndDelete(id).lean();
  }
}

module.exports = new PromotionRepository();
