// server/repositories/ProductStockRepository.js
const { ProductStock, Product, Shelf } = require('../models');

class ProductStockRepository {
  async findAll(query, { sort = '-last_updated', skip = 0, limit = 20 } = {}) {
    return await ProductStock.find(query)
      .populate({ path: 'product_id', select: 'name category unit price current_stock minimum_stock_level image_link sku barcode' })
      .populate({ path: 'shelf_id', select: 'shelf_number category capacity' })
      .sort(sort).skip(skip).limit(limit);
  }

  async countDocuments(query) {
    return await ProductStock.countDocuments(query);
  }

  async findById(id) {
    return await ProductStock.findById(id)
      .populate({ path: 'product_id', select: 'name description category unit price current_stock minimum_stock_level maximum_stock_level image_link sku barcode' })
      .populate({ path: 'shelf_id', select: 'shelf_number category capacity isfull note warehouse_id' });
  }

  async findRaw(id) {
    return await ProductStock.findById(id);
  }

  async create(data) {
    return await ProductStock.create(data);
  }

  async save(doc) {
    return await doc.save();
  }

  async updateMany(filter, update) {
    return await ProductStock.updateMany(filter, update);
  }

  async aggregate(pipeline) {
    return await ProductStock.aggregate(pipeline);
  }

  async findProduct(productId) {
    return await Product.findById(productId);
  }

  async findShelf(shelfId) {
    return await Shelf.findById(shelfId);
  }
}

module.exports = new ProductStockRepository();
