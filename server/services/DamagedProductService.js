// server/services/DamagedProductService.js
const damagedProductRepository = require('../repositories/DamagedProductRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

const CACHE_TTL = 600; // 10 minutes

class DamagedProductService {
  async getAllDamagedProducts({ page = 1, limit = 10, status, product_id, search, resolution_action, inventory_adjusted, sort = '-createdAt' }) {
    const query = { isDelete: false };
    if (status) query.status = status;
    if (product_id) query.product_id = product_id;
    if (resolution_action) query.resolution_action = resolution_action;
    if (inventory_adjusted !== undefined) query.inventory_adjusted = inventory_adjusted === 'true';
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [damagedProducts, total] = await Promise.all([
      damagedProductRepository.findAll(query, { sort, skip, limit: parseInt(limit) }),
      damagedProductRepository.countDocuments(query),
    ]);

    return { damagedProducts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
  }

  async getDamagedProductStats() {
    const cacheKey = 'damaged_product:stats';
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [totalDamaged, byStatus, byResolutionAction, totalQuantityDamaged, pendingReview, notAdjusted] = await Promise.all([
      damagedProductRepository.countDocuments({ isDelete: false }),
      damagedProductRepository.aggregate([{ $match: { isDelete: false } }, { $group: { _id: '$status', count: { $sum: 1 }, totalQuantity: { $sum: '$damaged_quantity' } } }]),
      damagedProductRepository.aggregate([{ $match: { isDelete: false, resolution_action: { $ne: null } } }, { $group: { _id: '$resolution_action', count: { $sum: 1 } } }]),
      damagedProductRepository.aggregate([{ $match: { isDelete: false } }, { $group: { _id: null, total: { $sum: '$damaged_quantity' } } }]),
      damagedProductRepository.countDocuments({ status: { $in: ['reported', 'reviewed'] }, isDelete: false }),
      damagedProductRepository.countDocuments({ inventory_adjusted: false, isDelete: false }),
    ]);

    const result = { total: totalDamaged, totalQuantityDamaged: totalQuantityDamaged[0]?.total || 0, pendingReview, notAdjusted, byStatus, byResolutionAction };
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getDamagedProductById(id) {
    const damagedProduct = await damagedProductRepository.findById(id);
    if (!damagedProduct || damagedProduct.isDelete) throw new NotFoundError('Damaged product not found');

    const productShelves = await damagedProductRepository.findProductShelves({ product_id: damagedProduct.product_id, isDelete: false });
    return { ...damagedProduct.toObject(), shelves: productShelves };
  }

  async getDamagedProductsByProductId(productId) {
    return await damagedProductRepository.findAll({ product_id: productId, isDelete: false }, { sort: '-createdAt', limit: 100 });
  }

  async createDamagedProduct(data) {
    const { product_id, shelf_id, damaged_quantity, status = 'reported', description, image_urls, resolution_action, notes } = data;

    if (!product_id) throw new BadRequestError('Product ID is required');
    if (!damaged_quantity || damaged_quantity <= 0) throw new BadRequestError('Damaged quantity must be greater than 0');

    const product = await damagedProductRepository.findProductById(product_id);
    if (!product || product.isDelete) throw new NotFoundError('Product not found');

    if (shelf_id) {
      const productShelf = await damagedProductRepository.findProductShelf({ product_id, shelf_id, isDelete: false });
      if (!productShelf) throw new NotFoundError('Product not found on this shelf');

      if (productShelf.quantity < damaged_quantity) {
        throw new BadRequestError(`Insufficient quantity on shelf. Available: ${productShelf.quantity}, Damaged: ${damaged_quantity}`);
      }

      const shelf = await damagedProductRepository.findShelfById(shelf_id);
      if (!shelf || shelf.isDelete) throw new NotFoundError('Shelf not found');

      productShelf.quantity -= damaged_quantity;
      if (productShelf.quantity === 0) productShelf.isDelete = true;
      await productShelf.save();

      shelf.current_quantity = Math.max(0, (shelf.current_quantity || 0) - damaged_quantity);
      await shelf.save();

      logger.info(`BUS-001: Reduced shelf quantity for damaged product. Product: ${product.name}, Shelf: ${shelf.shelf_number}, Qty: ${damaged_quantity}`);
    }

    const damagedProduct = await damagedProductRepository.create({
      product_id, shelf_id: shelf_id || null, product_name: product.name, damaged_quantity, unit: product.unit,
      status, description, image_urls, resolution_action, inventory_adjusted: false, notes
    });

    await redisClient.del('damaged_product:stats');
    logger.info(`BUS-001: Reported damaged product: ${damagedProduct._id}`);
    
    return await damagedProductRepository.findById(damagedProduct._id);
  }

  async updateDamagedProduct(id, data) {
    const damagedProduct = await damagedProductRepository.findById(id);
    if (!damagedProduct || damagedProduct.isDelete) throw new NotFoundError('Damaged product not found');

    const restrictedFields = ['damaged_quantity', 'product_id', 'shelf_id', 'product_name', 'unit'];
    for (const field of restrictedFields) {
      if (data[field] !== undefined && data[field] !== damagedProduct[field]?.toString() && data[field] !== damagedProduct[field]) {
        throw new BadRequestError(`Cannot update ${field}. Only information fields can be updated.`);
      }
    }

    const allowedFields = ['status', 'description', 'resolution_action', 'inventory_adjusted', 'notes', 'image_urls'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) damagedProduct[field] = data[field];
    }

    await damagedProductRepository.save(damagedProduct);
    await redisClient.del('damaged_product:stats');
    logger.info(`BUS-001: Updated damaged product report: ${id}`);
    
    return await damagedProductRepository.findById(id);
  }

  async adjustInventoryForDamaged(id) {
    const damagedProduct = await damagedProductRepository.findById(id);
    if (!damagedProduct || damagedProduct.isDelete) throw new NotFoundError('Damaged product not found');

    if (damagedProduct.inventory_adjusted) throw new BadRequestError('Inventory already adjusted for this damaged product');

    const product = await damagedProductRepository.findProductById(damagedProduct.product_id);
    if (!product) throw new NotFoundError('Product not found');

    const previousStock = product.current_stock;
    product.current_stock = Math.max(0, product.current_stock - damagedProduct.damaged_quantity);
    await product.save();

    damagedProduct.inventory_adjusted = true;
    damagedProduct.status = 'resolved';
    await damagedProductRepository.save(damagedProduct);

    await redisClient.del('damaged_product:stats');
    logger.info(`BUS-001: Adjusted warehouse inventory for damaged product: ${id}. Qty: ${damagedProduct.damaged_quantity}`);
    
    return { damagedProduct, product: { _id: product._id, name: product.name, previous_stock: previousStock, current_stock: product.current_stock, deducted: damagedProduct.damaged_quantity } };
  }

  async deleteDamagedProduct(id) {
    const damagedProduct = await damagedProductRepository.findById(id);
    if (!damagedProduct || damagedProduct.isDelete) throw new NotFoundError('Damaged product not found');

    damagedProduct.isDelete = true;
    await damagedProductRepository.save(damagedProduct);
    
    await redisClient.del('damaged_product:stats');
    logger.info(`BUS-001: Deleted damaged product record (soft delete): ${id}`);
    return true;
  }

  async getDamagedProductShelves(id) {
    const damagedProduct = await damagedProductRepository.findById(id);
    if (!damagedProduct || damagedProduct.isDelete) throw new NotFoundError('Damaged product not found');

    const shelves = await damagedProductRepository.findProductShelves({ product_id: damagedProduct.product_id, isDelete: false });
    return { product_id: damagedProduct.product_id, product_name: damagedProduct.product_name, shelves };
  }

  async bulkUpdateStatus(ids, status) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) throw new BadRequestError('Please provide an array of IDs');
    if (!status) throw new BadRequestError('Please provide a status');

    const result = await damagedProductRepository.updateMany({ _id: { $in: ids }, isDelete: false }, { status });
    await redisClient.del('damaged_product:stats');
    logger.info(`BUS-001: Bulk updated status for ${result.modifiedCount} damaged products to ${status}`);
    return result;
  }
}

module.exports = new DamagedProductService();
