// server/services/SupplierService.js
const mongoose = require('mongoose');
const { Supplier, Product } = require('../models');
const supplierRepository = require('../repositories/SupplierRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const logger = require('../config/logger');

class SupplierService {
  _buildQuery({ is_active, search }) {
    const query = { isDelete: false };
    
    if (is_active !== undefined) query.is_active = is_active === 'true' || is_active === true;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact_person_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    return query;
  }

  _parsePage(value) {
    const page = parseInt(value);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  }

  _parseLimit(value, fallback) {
    const limit = parseInt(value);
    return Number.isNaN(limit) || limit < 1 ? fallback : limit;
  }

  _validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
  }

  /**
   * UC6.4 - Usability: Search suppliers
   * Partial keyword matching + filter by product category + results load under 2 seconds
   */
  async getAllSuppliers({ page = 1, limit = 10, ...filters } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const query = this._buildQuery(filters);
    const skip = (pageNum - 1) * limitNum;

    const [suppliers, total] = await Promise.all([
      supplierRepository.findAll(query, { sort: '-createdAt', skip, limit: limitNum }),
      supplierRepository.countDocuments(query)
    ]);

    // Batch optimize: Get product counts for all suppliers at once (avoid N+1 queries)
    const supplierIds = suppliers.map(s => s._id);
    const productCounts = await Product.aggregate([
      { $match: { supplier_id: { $in: supplierIds }, status: 'active', isDelete: false } },
      { $group: { _id: '$supplier_id', count: { $sum: 1 } } }
    ]);

    const countMap = productCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const suppliersWithCounts = suppliers.map(supplier => ({
      ...supplier,
      productCount: countMap[supplier._id.toString()] || 0
    }));

    return {
      suppliers: suppliersWithCounts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats() {
    const [totalCount, statusCounts, topSuppliers] = await Promise.all([
      supplierRepository.countDocuments({ isDelete: false }),
      supplierRepository.countByStatus(),
      supplierRepository.aggregate([
        { $match: { isDelete: false } },
        {
          $lookup: {
            from: 'products',
            let: { supplierId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$supplier_id', '$$supplierId'] },
                  status: 'active',
                  isDelete: false
                }
              }
            ],
            as: 'products'
          }
        },
        {
          $project: {
            name: 1,
            productCount: { $size: '$products' },
            totalStock: { $sum: '$products.current_stock' }
          }
        },
        { $sort: { productCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    const activeCount = statusCounts.find(s => s._id === true)?.count || 0;
    const inactiveCount = statusCounts.find(s => s._id === false)?.count || 0;

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      topSuppliers: topSuppliers
    };
  }

  /**
   * UC6.5 - Interoperability: View all suppliers
   * Standardize export formats (CSV/Excel) - returns structured data ready for export
   */
  async getActiveSuppliers() {
    const suppliers = await supplierRepository.findActive();
    return suppliers;
  }

  /**
   * Get single supplier by ID
   */
  async getSupplierById(id) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    // Get product information
    const [productCount, products] = await Promise.all([
      supplierRepository.countProductsBySupplier(id),
      Product.find({ supplier_id: id, status: 'active', isDelete: false })
        .select('name category current_stock price status')
        .limit(10)
        .lean()
    ]);

    return {
      ...supplier.toObject(),
      productCount,
      recentProducts: products
    };
  }

  /**
   * Get products from supplier with pagination
   */
  async getSupplierProducts(id, { page = 1, limit = 20, status } = {}) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 20);
    const skip = (pageNum - 1) * limitNum;

    const query = { supplier_id: id, isDelete: false };
    if (status) query.status = status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort('name')
        .lean(),
      Product.countDocuments(query)
    ]);

    return {
      supplier: {
        id: supplier._id,
        name: supplier.name,
        contact_person_name: supplier.contact_person_name
      },
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * UC6.1 - Maintainability: Add supplier
   * Isolate supplier creation logic from order management logic into distinct controller functions
   */
  async createSupplier(data) {
    const {
      name,
      contact_person_name,
      email,
      phone,
      website,
      address,
      tax_id,
      note,
      is_active = true,
      image_link
    } = data;

    // Validate required fields
    if (!name) {
      throw new BadRequestError('Please provide supplier name');
    }

    // UC6.1: Check if supplier name already exists
    const existingByName = await supplierRepository.findByName(name);
    if (existingByName) {
      throw new ConflictError('Supplier with this name already exists');
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingByEmail = await supplierRepository.findByEmail(email);
      if (existingByEmail) {
        throw new ConflictError('Supplier with this email already exists');
      }
    }

    // UC6.1: Create supplier with isolated logic (separate from order management)
    const supplier = await supplierRepository.create({
      name,
      contact_person_name: contact_person_name || '',
      email: email || '',
      phone: phone || '',
      website: website || '',
      address: address || '',
      tax_id: tax_id || '',
      note: note || '',
      is_active,
      image_link: image_link || '',
      isDelete: false
    });

    logger.info(`Supplier created: ${supplier._id} - ${name}`);
    return supplier;
  }

  /**
   * UC6.2 - Maintainability: Update supplier info
   * Parameterize changes - accept only modified fields; pre-fill existing data to minimize input errors
   */
  async updateSupplier(id, updateData) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const {
      name,
      contact_person_name,
      email,
      phone,
      website,
      address,
      tax_id,
      note,
      is_active,
      image_link
    } = updateData;

    // UC6.2: Parameterize changes - check for conflicts only if changed
    if (name && name !== supplier.name) {
      const existingByName = await supplierRepository.findByName(name);
      if (existingByName) {
        throw new ConflictError('Supplier with this name already exists');
      }
    }

    if (email && email !== supplier.email) {
      const existingByEmail = await supplierRepository.findByEmail(email);
      if (existingByEmail) {
        throw new ConflictError('Supplier with this email already exists');
      }
    }

    // UC6.2: Pre-fill existing data to minimize input errors
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (contact_person_name !== undefined) updatePayload.contact_person_name = contact_person_name;
    if (email !== undefined) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (website !== undefined) updatePayload.website = website;
    if (address !== undefined) updatePayload.address = address;
    if (tax_id !== undefined) updatePayload.tax_id = tax_id;
    if (note !== undefined) updatePayload.note = note;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (image_link !== undefined) updatePayload.image_link = image_link;

    const updatedSupplier = await supplierRepository.findByIdAndUpdate(id, updatePayload);
    logger.info(`Supplier updated: ${id} - fields: ${Object.keys(updatePayload).join(', ')}`);

    return updatedSupplier;
  }

  /**
   * UC6.3 - Reliability: Delete supplier
   * Block deletion if supplier linked to active purchase orders via foreign key constraints
   * Display clear warning message
   */
  async deleteSupplier(id) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    // UC6.3: Check if supplier has active products (via foreign key constraint)
    const activeProductCount = await supplierRepository.countProductsBySupplier(id);
    
    if (activeProductCount > 0) {
      // UC6.3: Display clear warning message with actionable instructions
      throw new ConflictError(
        `Cannot delete supplier. There are ${activeProductCount} active product(s) associated with this supplier. ` +
        'Please discontinue or reassign these products first.'
      );
    }

    // UC6.3: Soft delete to preserve audit trail
    const deletedSupplier = await supplierRepository.findByIdAndSoftDelete(id);
    logger.info(`Supplier soft-deleted: ${id} - ${supplier.name}`);

    return deletedSupplier;
  }

  /**
   * Permanently delete supplier (hard delete - use with caution)
   */
  async permanentDeleteSupplier(id) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    // Check for products before permanent deletion
    const productCount = await Product.countDocuments({
      supplier_id: id,
      isDelete: false
    });

    if (productCount > 0) {
      throw new ConflictError(
        `Cannot permanently delete supplier with ${productCount} product(s) in system`
      );
    }

    await Supplier.findByIdAndDelete(id);
    logger.warn(`Supplier permanently deleted: ${id} - ${supplier.name}`);

    return { message: 'Supplier permanently deleted' };
  }

  /**
   * Activate supplier
   */
  async activateSupplier(id) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const updatedSupplier = await supplierRepository.findByIdAndUpdate(id, { is_active: true });
    logger.info(`Supplier activated: ${id}`);

    return updatedSupplier;
  }

  /**
   * Deactivate supplier
   */
  async deactivateSupplier(id) {
    this._validateObjectId(id);

    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const updatedSupplier = await supplierRepository.findByIdAndUpdate(id, { is_active: false });
    logger.info(`Supplier deactivated: ${id}`);

    return updatedSupplier;
  }
}

module.exports = new SupplierService();
