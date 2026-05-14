// server/repositories/ProductBatchRepository.js
const { ProductBatch } = require('../models');

class ProductBatchRepository {
  async create(data) {
    return await ProductBatch.create(data);
  }

  async findById(id) {
    return await ProductBatch.findById(id)
      .populate({ path: 'product_id', select: 'name sku barcode current_stock' })
      .populate({ path: 'shelf_id', select: 'shelf_number' });
  }

  async findAll(query, { sort = '-createdAt', skip = 0, limit = 50 } = {}) {
    return await ProductBatch.find(query)
      .populate({ path: 'product_id', select: 'name sku barcode' })
      .populate({ path: 'shelf_id', select: 'shelf_number' })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(query) {
    return await ProductBatch.countDocuments(query);
  }

  async findByProduct(productId, query = {}) {
    return await ProductBatch.find({ product_id: productId, ...query })
      .populate({ path: 'shelf_id', select: 'shelf_number' })
      .sort('expiry_date');
  }

  async save(batch) {
    return await batch.save();
  }

  async softDelete(id) {
    return await ProductBatch.findByIdAndUpdate(id, { isDelete: true }, { new: true });
  }
}

module.exports = new ProductBatchRepository();
