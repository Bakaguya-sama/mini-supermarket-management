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

  async create(data) {
    return await Promotion.create(data);
  }

  async save(promotion) {
    return await promotion.save();
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    return await Promotion.findOneAndUpdate({ _id: id, isDelete: false }, data, options);
  }

  async update(id, data) {
    return await this.findByIdAndUpdate(id, data);
  }

  async findByIdAndSoftDelete(id) {
    return await Promotion.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );
  }

  async getPromotionProducts(promotionId) {
    return await PromotionProduct.find({ promotion_id: promotionId, isDelete: false })
      .populate('product_id').lean();
  }
}

module.exports = new PromotionRepository();
