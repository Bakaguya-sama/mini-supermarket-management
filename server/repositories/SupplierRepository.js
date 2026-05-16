// server/repositories/SupplierRepository.js
const { Supplier, Product } = require('../models');

class SupplierRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await Supplier.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countDocuments(query) {
    return await Supplier.countDocuments(query);
  }

  async findById(id) {
    return await Supplier.findById(id);
  }

  async findByName(name) {
    return await Supplier.findOne({ name, isDelete: false });
  }

  async findByEmail(email) {
    return await Supplier.findOne({ email, isDelete: false });
  }

  async create(supplierData) {
    return await Supplier.create(supplierData);
  }

  async findByIdAndUpdate(id, updateData) {
    return await Supplier.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findByIdAndSoftDelete(id) {
    return await Supplier.findByIdAndUpdate(
      id,
      { isDelete: true, is_active: false },
      { new: true }
    );
  }

  async aggregate(pipeline) {
    return await Supplier.aggregate(pipeline);
  }

  async countProductsBySupplier(supplierId) {
    return await Product.countDocuments({
      supplier_id: supplierId,
      status: 'active',
      isDelete: false
    });
  }

  async getSupplierWithProducts(id, limit = 10) {
    return await Supplier.findById(id);
  }

  async countByStatus() {
    return await Supplier.aggregate([
      {
        $group: {
          _id: '$is_active',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async findActive() {
    return await Supplier.find({ is_active: true, isDelete: false })
      .select('name contact_person_name email phone')
      .sort('name')
      .lean();
  }
}

module.exports = new SupplierRepository();
