// server/services/ProductStockService.js
const productStockRepository = require('../repositories/ProductStockRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

const CACHE_TTL = 120;

class ProductStockService {
  _buildQuery({ product_id, shelf_id, warehouse_id, status, expiry_before, expiry_after }) {
    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (shelf_id) query.shelf_id = shelf_id;
    if (warehouse_id) query.warehouse_id = warehouse_id;
    if (status) query.status = status;
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

  async getAllProductStocks({ page = 1, limit = 20, sort = '-last_updated', ...filters }) {
    const query = this._buildQuery(filters);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [productStocks, total] = await Promise.all([
      productStockRepository.findAll(query, { sort, skip, limit: parseInt(limit) }),
      productStockRepository.countDocuments(query),
    ]);
    return { productStocks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  async getProductStockStats() {
    const cacheKey = 'productstock:stats';
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [totalRecords, byStatus, totalQuantity, lowStockCount, byShelves] = await Promise.all([
      productStockRepository.countDocuments({ isDelete: false }),
      productStockRepository.aggregate([{ $match: { isDelete: false } }, { $group: { _id: '$status', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }]),
      productStockRepository.aggregate([{ $match: { isDelete: false } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
      productStockRepository.countDocuments({ status: 'low_stock', isDelete: false }),
      productStockRepository.aggregate([
        { $match: { isDelete: false, shelf_id: { $ne: null } } },
        { $lookup: { from: 'shelves', localField: 'shelf_id', foreignField: '_id', as: 'shelf' } },
        { $unwind: '$shelf' },
        { $group: { _id: { shelf_id: '$shelf_id', shelf_number: '$shelf.shelf_number' }, product_count: { $sum: 1 }, total_quantity: { $sum: '$quantity' } } },
        { $sort: { '_id.shelf_number': 1 } },
      ]),
    ]);

    const result = { total_records: totalRecords, total_quantity: totalQuantity[0]?.total || 0, low_stock_count: lowStockCount, by_status: byStatus, by_shelves: byShelves };
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getProductStockById(id) {
    const productStock = await productStockRepository.findById(id);
    if (!productStock || productStock.isDelete) throw new NotFoundError('Product stock record not found');
    return productStock;
  }

  async getStockByProduct(productId, filters = {}) {
    const query = { product_id: productId, isDelete: false };
    const { expiry_before, expiry_after } = filters;
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) { const d = new Date(expiry_before); if (isNaN(d)) throw new BadRequestError('Invalid expiry_before date'); query.expiry_date.$lte = d; }
      if (expiry_after) { const d2 = new Date(expiry_after); if (isNaN(d2)) throw new BadRequestError('Invalid expiry_after date'); query.expiry_date.$gte = d2; }
    }

    const productStocks = await productStockRepository.findAll(query, { sort: 'shelf_id' });
    const product = await productStockRepository.findProduct(productId);
    const totalInShelves = productStocks.reduce((sum, s) => sum + s.quantity, 0);
    return { product, total_in_shelves: totalInShelves, stocks: productStocks };
  }

  async getStockByShelf(shelfId, filters = {}) {
    const query = { shelf_id: shelfId, isDelete: false };
    const { expiry_before, expiry_after } = filters;
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) { const d = new Date(expiry_before); if (isNaN(d)) throw new BadRequestError('Invalid expiry_before date'); query.expiry_date.$lte = d; }
      if (expiry_after) { const d2 = new Date(expiry_after); if (isNaN(d2)) throw new BadRequestError('Invalid expiry_after date'); query.expiry_date.$gte = d2; }
    }

    const productStocks = await productStockRepository.findAll(query, { sort: 'product_id' });
    const shelf = await productStockRepository.findShelf(shelfId);
    const totalQuantity = productStocks.reduce((sum, s) => sum + s.quantity, 0);
    return { shelf, total_quantity: totalQuantity, stocks: productStocks };
  }

  async getLowStockProducts(limit = 50) {
    return await productStockRepository.findAll({ status: 'low_stock', isDelete: false }, { sort: 'quantity', limit: parseInt(limit) });
  }

  async createProductStock(data) {
    const { product_id, shelf_id, expiry_date } = data;

    let expiryDateObj;
    if (expiry_date != null && expiry_date !== '') {
      expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj)) throw new BadRequestError('Invalid expiry_date');
    }

    const product = await productStockRepository.findProduct(product_id);
    if (!product || product.isDelete) throw new NotFoundError('Product not found');

    if (shelf_id) {
      const shelf = await productStockRepository.findShelf(shelf_id);
      if (!shelf || shelf.isDelete) throw new NotFoundError('Shelf not found');
    }

    const productStock = await productStockRepository.create({ ...data, expiry_date: expiryDateObj || undefined, last_updated: new Date() });
    await redisClient.del('productstock:stats');
    logger.info(`BUS-003: Product stock record created for product ${product_id}`);
    return await productStockRepository.findById(productStock._id);
  }

  async updateProductStock(id, data) {
    const productStock = await productStockRepository.findRaw(id);
    if (!productStock || productStock.isDelete) throw new NotFoundError('Product stock record not found');

    const { shelf_id, section, slot, status, quantity, damaged_quantity, reason, expiry_date } = data;

    if (expiry_date !== undefined) {
      if (expiry_date === null || expiry_date === '') { productStock.expiry_date = null; }
      else {
        const expiryDateObj = new Date(expiry_date);
        if (isNaN(expiryDateObj)) throw new BadRequestError('Invalid expiry_date');
        productStock.expiry_date = expiryDateObj;
      }
    }
    if (shelf_id) {
      const shelf = await productStockRepository.findShelf(shelf_id);
      if (!shelf || shelf.isDelete) throw new NotFoundError('Shelf not found');
      productStock.shelf_id = shelf_id;
    }
    if (section !== undefined) productStock.section = section;
    if (slot !== undefined) productStock.slot = slot;
    if (status) productStock.status = status;
    if (quantity !== undefined) productStock.quantity = quantity;
    if (damaged_quantity !== undefined) productStock.damaged_quantity = damaged_quantity;
    if (reason !== undefined) productStock.reason = reason;
    productStock.last_updated = new Date();

    await productStockRepository.save(productStock);
    await redisClient.del('productstock:stats');
    return await productStockRepository.findById(id);
  }

  async adjustStockQuantity(id, adjustment, reason) {
    if (adjustment === undefined || adjustment === 0) throw new BadRequestError('Please provide a non-zero adjustment value');

    const productStock = await productStockRepository.findRaw(id);
    if (!productStock || productStock.isDelete) throw new NotFoundError('Product stock record not found');

    const oldQuantity = productStock.quantity;
    productStock.quantity = Math.max(0, productStock.quantity + adjustment);
    if (reason) productStock.reason = reason;
    productStock.last_updated = new Date();
    await productStockRepository.save(productStock);

    logger.info(`BUS-003: Stock ${id} adjusted by ${adjustment}. Old: ${oldQuantity}, New: ${productStock.quantity}`);
    const populated = await productStockRepository.findById(id);
    return { ...populated.toObject(), adjustment_info: { old_quantity: oldQuantity, adjustment, new_quantity: productStock.quantity } };
  }

  async deleteProductStock(id) {
    const productStock = await productStockRepository.findRaw(id);
    if (!productStock || productStock.isDelete) throw new NotFoundError('Product stock record not found');
    productStock.isDelete = true;
    await productStockRepository.save(productStock);
    await redisClient.del('productstock:stats');
    logger.info(`BUS-003: Product stock record ${id} soft-deleted`);
  }

  async bulkUpdateStatus(ids, status) {
    if (!ids?.length) throw new BadRequestError('Please provide an array of product stock IDs');
    if (!status) throw new BadRequestError('Please provide a status');
    const result = await productStockRepository.updateMany({ _id: { $in: ids }, isDelete: false }, { status, last_updated: new Date() });
    await redisClient.del('productstock:stats');
    return { matched: result.matchedCount, modified: result.modifiedCount };
  }
}

module.exports = new ProductStockService();
