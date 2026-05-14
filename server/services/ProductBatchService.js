// server/services/ProductBatchService.js
const { Product } = require('../models');
const productBatchRepository = require('../repositories/ProductBatchRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

const CACHE_TTL = 300; // 5 phút

class ProductBatchService {
  // ─── Helpers ────────────────────────────────────────────────
  _buildQuery({ product_id, sku, barcode, status, expiry_before, expiry_after }) {
    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (sku) query.sku = sku;
    if (barcode) query.barcode = barcode;
    if (status) query.status = status;

    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d)) throw new BadRequestError('Invalid expiry_before');
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2)) throw new BadRequestError('Invalid expiry_after');
        query.expiry_date.$gte = d2;
      }
    }
    return query;
  }

  // ─── CRUD ────────────────────────────────────────────────────
  async createBatch(data) {
    const { product_id, quantity = 0, expiry_date } = data;

    if (!product_id) throw new BadRequestError('product_id is required');
    const qty = parseInt(quantity) || 0;
    if (qty < 0) throw new BadRequestError('quantity must be >= 0');

    const product = await Product.findById(product_id);
    if (!product || product.isDelete) throw new NotFoundError('Product not found');

    let expiryObj;
    if (expiry_date) {
      expiryObj = new Date(expiry_date);
      if (isNaN(expiryObj)) throw new BadRequestError('Invalid expiry_date');
    }

    const batch = await productBatchRepository.create({
      ...data,
      quantity: qty,
      expiry_date: expiryObj,
      purchase_date: data.purchase_date ? new Date(data.purchase_date) : undefined,
    });

    if (qty !== 0) {
      await Product.findByIdAndUpdate(product_id, { $inc: { current_stock: qty } });
      logger.info(`BUS-003: Stock +${qty} for product ${product_id} via new batch ${batch._id}`);
    }

    // Invalidate cache
    await redisClient.del(`batch:product:${product_id}`);

    return await productBatchRepository.findById(batch._id);
  }

  async getAllBatches({ page = 1, limit = 50, sort = '-createdAt', ...filters }) {
    const query = this._buildQuery(filters);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [batches, total] = await Promise.all([
      productBatchRepository.findAll(query, { sort, skip, limit: parseInt(limit) }),
      productBatchRepository.countDocuments(query),
    ]);

    return { batches, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  async getBatchById(id) {
    const cacheKey = `batch:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const batch = await productBatchRepository.findById(id);
    if (!batch || batch.isDelete) throw new NotFoundError('Batch not found');

    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(batch));
    return batch;
  }

  async getBatchesByProduct(productId, filters = {}) {
    const cacheKey = `batch:product:${productId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = this._buildQuery(filters);
    const batches = await productBatchRepository.findByProduct(productId, query);
    const totalQuantity = batches.reduce((s, b) => s + (b.quantity || 0), 0);
    const product = await Product.findById(productId).select('name current_stock');

    const result = { product, total_quantity: totalQuantity, batches };
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async updateBatch(id, updates) {
    const batch = await productBatchRepository.findById(id);
    if (!batch || batch.isDelete) throw new NotFoundError('Batch not found');

    if (updates.quantity !== undefined) {
      const newQty = parseInt(updates.quantity) || 0;
      const delta = newQty - (batch.quantity || 0);
      if (delta !== 0) {
        await Product.findByIdAndUpdate(batch.product_id, { $inc: { current_stock: delta } });
        logger.info(`BUS-003: Stock adjusted by ${delta} for product ${batch.product_id} via batch update`);
      }
    }

    if (updates.expiry_date) {
      const d = new Date(updates.expiry_date);
      if (isNaN(d)) throw new BadRequestError('Invalid expiry_date');
      updates.expiry_date = d;
    }

    Object.assign(batch, updates);
    await productBatchRepository.save(batch);

    // Invalidate cache
    await redisClient.del(`batch:${id}`);
    await redisClient.del(`batch:product:${batch.product_id}`);

    return await productBatchRepository.findById(batch._id);
  }

  async adjustBatchQuantity(id, delta) {
    const d = parseInt(delta);
    if (isNaN(d)) throw new BadRequestError('delta must be a number');

    const batch = await productBatchRepository.findById(id);
    if (!batch || batch.isDelete) throw new NotFoundError('Batch not found');

    const newQty = (batch.quantity || 0) + d;
    if (newQty < 0) throw new BadRequestError('Resulting quantity cannot be negative');

    batch.quantity = newQty;
    await productBatchRepository.save(batch);

    if (d !== 0) {
      await Product.findByIdAndUpdate(batch.product_id, { $inc: { current_stock: d } });
      logger.info(`BUS-003: Batch ${id} quantity adjusted by ${d}`);
    }

    await redisClient.del(`batch:${id}`);
    return batch;
  }

  async deleteBatch(id) {
    const batch = await productBatchRepository.findById(id);
    if (!batch || batch.isDelete) throw new NotFoundError('Batch not found');

    const qty = batch.quantity || 0;
    if (qty !== 0) {
      await Product.findByIdAndUpdate(batch.product_id, { $inc: { current_stock: -qty } });
      logger.info(`BUS-003: Stock -${qty} for product ${batch.product_id} via batch soft-delete`);
    }

    await productBatchRepository.softDelete(id);
    await redisClient.del(`batch:${id}`);
    await redisClient.del(`batch:product:${batch.product_id}`);
  }
}

module.exports = new ProductBatchService();
