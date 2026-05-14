// server/repositories/DamagedProductRepository.js
const { DamagedProduct, Product, Shelf, ProductShelf } = require('../models');

class DamagedProductRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await DamagedProduct.find(query)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id current_stock image_link sku barcode',
        populate: { path: 'supplier_id', select: 'name contact_person_name phone email address' }
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(query) {
    return await DamagedProduct.countDocuments(query);
  }

  async findById(id) {
    return await DamagedProduct.findById(id)
      .populate({
        path: 'product_id',
        select: 'name description category unit price supplier_id current_stock minimum_stock_level maximum_stock_level image_link sku barcode',
        populate: { path: 'supplier_id', select: 'name contact_person_name phone email address' }
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
      });
  }

  async findMany(query) {
    return await DamagedProduct.find(query);
  }

  async create(data) {
    return await DamagedProduct.create(data);
  }

  async save(doc) {
    return await doc.save();
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    return await DamagedProduct.findByIdAndUpdate(id, data, options);
  }

  async updateMany(query, update) {
    return await DamagedProduct.updateMany(query, update);
  }

  async aggregate(pipeline) {
    return await DamagedProduct.aggregate(pipeline);
  }

  // Related models operations
  async findProductById(id) {
    return await Product.findById(id);
  }

  async findProductShelf(query) {
    return await ProductShelf.findOne(query);
  }

  async findProductShelves(query) {
    return await ProductShelf.find(query).populate({
      path: 'shelf_id',
      select: 'shelf_number category capacity isfull note warehouse_id'
    });
  }

  async findShelfById(id) {
    return await Shelf.findById(id);
  }
}

module.exports = new DamagedProductRepository();
