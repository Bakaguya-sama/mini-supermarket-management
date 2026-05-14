// server/services/ProductService.js
const { Supplier, ProductBatch } = require('../models');
const productRepository = require('../repositories/ProductRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

const CACHE_TTL = 300; // 5 phút

class ProductService {
  // ─── Helpers ────────────────────────────────────────────────
  _buildQuery({ category, status, supplier_id, search, minPrice, maxPrice, expiry_before, expiry_after }) {
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (supplier_id) query.supplier_id = supplier_id;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d)) throw new BadRequestError('Invalid expiry_before date');
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2)) throw new BadRequestError('Invalid expiry_after date');
        query.expiry_date.$gte = d2;
      }
    }
    return query;
  }

  // ─── READ ────────────────────────────────────────────────────
  async getAllProducts({ page = 1, limit = 10, sort = '-createdAt', ...filters }) {
    const query = this._buildQuery(filters);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      productRepository.findAll(query, { sort, skip, limit: parseInt(limit) }),
      productRepository.countDocuments(query),
    ]);
    return { products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  async getProductStats() {
    const cacheKey = 'product:stats';
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [total, active, inactive, discontinued, lowStockCount, byCategory, totalInventoryValue] = await Promise.all([
      productRepository.countDocuments({}),
      productRepository.countDocuments({ status: 'active' }),
      productRepository.countDocuments({ status: 'inactive' }),
      productRepository.countDocuments({ status: 'discontinued' }),
      productRepository.countDocuments({ $expr: { $lte: ['$current_stock', '$minimum_stock_level'] } }),
      productRepository.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$current_stock' } } }]),
      productRepository.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: { $multiply: ['$current_stock', '$price'] } } } }]),
    ]);

    const result = { total, active, inactive, discontinued, lowStockCount, totalInventoryValue: totalInventoryValue[0]?.total || 0, byCategory };
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getLowStockProducts(limit = 50) {
    return await productRepository.findAll(
      { $expr: { $lte: ['$current_stock', '$minimum_stock_level'] }, status: 'active' },
      { sort: 'current_stock', limit: parseInt(limit) }
    );
  }

  async getProductsByCategory(category, { page = 1, limit = 20 } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { category, status: 'active' };
    const [products, total] = await Promise.all([
      productRepository.findAll(query, { sort: 'name', skip, limit: parseInt(limit) }),
      productRepository.countDocuments(query),
    ]);
    return { products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  async getProductById(id) {
    const cacheKey = `product:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const [shelfLocations, batchAgg] = await Promise.all([
      productRepository.getShelfLocations(product._id),
      productRepository.getBatchAggregation(product._id),
    ]);

    const now = new Date();
    const batches = batchAgg.map(b => ({ expiry_date: b._id, batchCount: b.batchCount, totalQuantity: b.totalQuantity }));
    const expiredBatches = batches.filter(b => b.expiry_date && new Date(b.expiry_date) < now);

    const result = {
      ...product.toObject(),
      shelfLocations,
      batch_summary: {
        distinctExpiryCount: batches.filter(b => b.expiry_date !== null).length,
        batches,
        expiredBatchesCount: expiredBatches.reduce((s, b) => s + (b.batchCount || 0), 0),
        expiredTotalQuantity: expiredBatches.reduce((s, b) => s + (b.totalQuantity || 0), 0),
        earliestExpiry: batches.find(b => b.expiry_date !== null)?.expiry_date || null,
      },
    };

    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getProductsBySupplier(supplierId, { page = 1, limit = 20, status } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { supplier_id: supplierId };
    if (status) query.status = status;
    const [products, total] = await Promise.all([
      productRepository.findAll(query, { sort: 'name', skip, limit: parseInt(limit) }),
      productRepository.countDocuments(query),
    ]);
    return { products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  // ─── WRITE ───────────────────────────────────────────────────
  async createProduct(data) {
    const { name, unit, supplier_id, current_stock, maximum_stock_level, expiry_date } = data;
    if (!name || !unit) throw new BadRequestError('Please provide product name and unit');

    let expiryDateObj;
    if (expiry_date != null && expiry_date !== '') {
      expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj)) throw new BadRequestError('Invalid expiry_date');
      if (expiryDateObj < new Date()) throw new BadRequestError('expiry_date cannot be in the past');
    }

    if (supplier_id) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) throw new NotFoundError('Supplier not found');
    }

    const existingProduct = await productRepository.findOne({ name });
    if (existingProduct) throw new ConflictError('Product with this name already exists');

    if (maximum_stock_level !== undefined && current_stock !== undefined) {
      const curr = parseInt(current_stock), max = parseInt(maximum_stock_level);
      if (!isNaN(max) && max > 0 && curr > max) throw new BadRequestError('Current stock cannot exceed maximum stock level');
    }

    const product = await productRepository.create({ ...data, expiry_date: expiryDateObj || undefined });
    await product.populate('supplier_id', 'name contact_person_name email phone');

    // Invalidate stats cache
    await redisClient.del('product:stats');
    logger.info(`BUS-001: New product created: ${product._id} - ${product.name}`);
    return product;
  }

  async updateProduct(id, data) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const { supplier_id, current_stock, maximum_stock_level, expiry_date, restockBatch, ...rest } = data;

    if (supplier_id && supplier_id !== product.supplier_id?.toString()) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) throw new NotFoundError('Supplier not found');
    }

    if (maximum_stock_level !== undefined && current_stock !== undefined) {
      const curr = parseInt(current_stock), max = parseInt(maximum_stock_level);
      if (!isNaN(max) && max > 0 && curr > max) throw new BadRequestError('Current stock cannot exceed maximum stock level');
    }

    Object.assign(product, rest);
    if (supplier_id !== undefined) product.supplier_id = supplier_id;
    if (current_stock !== undefined) product.current_stock = parseInt(current_stock) || 0;
    if (maximum_stock_level !== undefined) product.maximum_stock_level = maximum_stock_level;

    if (expiry_date !== undefined) {
      if (expiry_date === null || expiry_date === '') {
        product.expiry_date = null;
      } else {
        const expiryDateObj = new Date(expiry_date);
        if (isNaN(expiryDateObj)) throw new BadRequestError('Invalid expiry_date');
        if (expiryDateObj < new Date()) throw new BadRequestError('expiry_date cannot be in the past');
        product.expiry_date = expiryDateObj;
      }
    }

    let createdBatch = null;
    if (restockBatch && typeof restockBatch === 'object') {
      const qty = parseInt(restockBatch.quantity) || 0;
      if (qty < 0) throw new BadRequestError('restockBatch.quantity must be >= 0');
      const expiryObj = restockBatch.expiry_date ? new Date(restockBatch.expiry_date) : undefined;
      if (restockBatch.expiry_date && isNaN(expiryObj)) throw new BadRequestError('Invalid restockBatch.expiry_date');

      createdBatch = await ProductBatch.create({
        product_id: product._id,
        batch_id: restockBatch.batch_id || undefined,
        quantity: qty,
        expiry_date: expiryObj,
        sku: restockBatch.sku || product.sku || undefined,
        barcode: restockBatch.barcode || product.barcode || undefined,
        supplier_id: restockBatch.supplier_id || product.supplier_id || undefined,
        shelf_id: restockBatch.shelf_id || undefined,
        purchase_date: restockBatch.purchase_date ? new Date(restockBatch.purchase_date) : undefined,
        cost: restockBatch.cost || undefined,
        source: 'restock',
      });

      if (qty !== 0) {
        await productRepository.findByIdAndUpdate(product._id, { $inc: { current_stock: qty } });
        const refreshed = await productRepository.findById(product._id);
        product.current_stock = refreshed.current_stock;
        logger.info(`BUS-003: Restock batch created for product ${product._id}, +${qty}`);
      }
    }

    await productRepository.save(product);
    await product.populate('supplier_id', 'name contact_person_name email phone');

    // Invalidate caches
    await redisClient.del(`product:${id}`);
    await redisClient.del('product:stats');

    return { product, createdBatch };
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    product.isDelete = true;
    product.status = 'discontinued';
    await productRepository.save(product);
    await redisClient.del(`product:${id}`);
    await redisClient.del('product:stats');
    logger.info(`BUS-001: Product soft-deleted: ${id}`);
    return product;
  }

  async permanentDeleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    await productRepository.deleteRelatedData(product._id);
    logger.info(`BUS-001: Product permanently deleted: ${id}`);
  }

  async updateProductStock(id, { current_stock, adjustment_type, adjustment_value }) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    if (current_stock !== undefined) {
      product.current_stock = current_stock;
    } else if (adjustment_type && adjustment_value !== undefined) {
      if (adjustment_type === 'add') product.current_stock += parseInt(adjustment_value);
      else if (adjustment_type === 'subtract') {
        product.current_stock -= parseInt(adjustment_value);
        if (product.current_stock < 0) product.current_stock = 0;
      }
    } else {
      throw new BadRequestError('Provide current_stock or adjustment_type with adjustment_value');
    }

    await productRepository.save(product);
    await redisClient.del(`product:${id}`);
    return product;
  }

  async updateProductPrice(id, price) {
    if (price === undefined || price < 0) throw new BadRequestError('Please provide a valid price');
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    const oldPrice = product.price;
    product.price = price;
    await productRepository.save(product);
    await redisClient.del(`product:${id}`);
    logger.info(`BUS-001: Product ${id} price updated from ${oldPrice} to ${price}`);
    return { product, oldPrice, newPrice: price };
  }

  async activateProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    product.status = 'active';
    await productRepository.save(product);
    await redisClient.del(`product:${id}`);
    return product;
  }
}

module.exports = new ProductService();
