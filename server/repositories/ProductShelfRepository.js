// server/repositories/ProductShelfRepository.js
const { ProductShelf, Shelf, Product } = require('../models');

class ProductShelfRepository {
  _populateOptions() {
    return [
      {
        path: 'product_id',
        select: 'name category unit price current_stock minimum_stock_level maximum_stock_level image_link sku barcode supplier_id status description',
        populate: { path: 'supplier_id', select: 'name contact_person_name email phone' }
      },
      {
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number description capacity current_quantity'
      }
    ];
  }

  async findAll(query, { sort = '-createdAt', skip = 0, limit = 20 } = {}) {
    return await ProductShelf.find(query)
      .populate(this._populateOptions())
      .sort(sort).skip(skip).limit(limit);
  }

  async countDocuments(query) {
    return await ProductShelf.countDocuments(query);
  }

  async findById(id) {
    return await ProductShelf.findOne({ _id: id, isDelete: false }).populate(this._populateOptions());
  }

  async findOne(query) {
    return await ProductShelf.findOne(query);
  }

  async create(data) {
    return await ProductShelf.create(data);
  }

  async save(doc) {
    return await doc.save();
  }

  async aggregate(pipeline) {
    return await ProductShelf.aggregate(pipeline);
  }

  async findProduct(productId) {
    return await Product.findById(productId);
  }

  async findShelf(shelfId) {
    return await Shelf.findById(shelfId);
  }

  async saveProduct(product) {
    return await product.save();
  }

  async saveShelf(shelf) {
    return await shelf.save();
  }
}

module.exports = new ProductShelfRepository();
