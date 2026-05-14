// server/repositories/ProductRepository.js
const { Product, ProductShelf, ProductStock, ProductBatch } = require('../models');

class ProductRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await Product.find(query)
      .populate('supplier_id', 'name contact_person_name email phone')
      .sort(sort).skip(skip).limit(limit).lean();
  }

  async countDocuments(query) {
    return await Product.countDocuments(query);
  }

  async findById(id) {
    return await Product.findById(id).populate('supplier_id');
  }

  async findOne(query) {
    return await Product.findOne(query);
  }

  async create(data) {
    return await Product.create(data);
  }

  async save(product) {
    return await product.save();
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await Product.findByIdAndUpdate(id, update, options);
  }

  async aggregate(pipeline) {
    return await Product.aggregate(pipeline);
  }

  async getShelfLocations(productId) {
    return await ProductShelf.find({ product_id: productId }).populate('shelf_id');
  }

  async getBatchAggregation(productId) {
    return await ProductBatch.aggregate([
      { $match: { product_id: productId, isDelete: false } },
      { $group: { _id: '$expiry_date', batchCount: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } },
    ]);
  }

  async deleteRelatedData(productId) {
    await ProductShelf.deleteMany({ product_id: productId });
    await ProductStock.deleteMany({ product_id: productId });
    await Product.findByIdAndDelete(productId);
  }
}

module.exports = new ProductRepository();
