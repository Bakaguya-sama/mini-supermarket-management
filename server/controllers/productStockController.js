// controllers/productStockController.js
const productStockService = require('../services/ProductStockService');
const logger = require('../config/logger');

/** @route GET /api/product-stocks */
exports.getAllProductStocks = async (req, res, next) => {
  try {
    const { productStocks, total, page, pages } = await productStockService.getAllProductStocks(req.query);
    res.status(200).json({ success: true, count: productStocks.length, total, page, pages, data: productStocks });
  } catch (error) { next(error); }
};

/** @route GET /api/product-stocks/stats */
exports.getProductStockStats = async (req, res, next) => {
  try {
    const data = await productStockService.getProductStockStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-stocks/:id */
exports.getProductStockById = async (req, res, next) => {
  try {
    const data = await productStockService.getProductStockById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-stocks/product/:productId */
exports.getStockByProduct = async (req, res, next) => {
  try {
    const data = await productStockService.getStockByProduct(req.params.productId, req.query);
    res.status(200).json({ success: true, count: data.stocks.length, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-stocks/shelf/:shelfId */
exports.getStockByShelf = async (req, res, next) => {
  try {
    const data = await productStockService.getStockByShelf(req.params.shelfId, req.query);
    res.status(200).json({ success: true, count: data.stocks.length, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-stocks/low-stock */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const data = await productStockService.getLowStockProducts(req.query.limit);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

/** @route POST /api/product-stocks */
exports.createProductStock = async (req, res, next) => {
  try {
    const data = await productStockService.createProductStock(req.body);
    logger.info(`Product stock created successfully in controller: ${data._id}`);
    res.status(201).json({ success: true, message: 'Product stock record created successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/product-stocks/:id */
exports.updateProductStock = async (req, res, next) => {
  try {
    const data = await productStockService.updateProductStock(req.params.id, req.body);
    logger.info(`Product stock updated successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product stock updated successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/product-stocks/:id/adjust */
exports.adjustStockQuantity = async (req, res, next) => {
  try {
    const { adjustment, reason } = req.body;
    const data = await productStockService.adjustStockQuantity(req.params.id, adjustment, reason);
    logger.info(`Product stock adjusted successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Stock quantity adjusted successfully', data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/product-stocks/:id */
exports.deleteProductStock = async (req, res, next) => {
  try {
    await productStockService.deleteProductStock(req.params.id);
    logger.info(`Product stock soft deleted successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product stock record deleted successfully' });
  } catch (error) { next(error); }
};

/** @route PUT /api/product-stocks/bulk/update-status */
exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const data = await productStockService.bulkUpdateStatus(ids, status);
    logger.info(`Product stocks bulk updated successfully in controller. Modified: ${data.modified}`);
    res.status(200).json({ success: true, message: `Updated ${data.modified} product stock record(s)`, data });
  } catch (error) { next(error); }
};
