// controllers/productShelfController.js
// Business Rules:
// 1. One product CAN be on MULTIPLE shelves (many-to-many)
// 2. Adding product to shelf deducts quantity from warehouse (current_stock)
// 3. Each shelf record is a separate section with its own capacity and quantity
const productShelfService = require('../services/ProductShelfService');
const logger = require('../config/logger');

/** @route GET /api/product-shelves */
exports.getAllProductShelves = async (req, res, next) => {
  try {
    const { productShelves, total, page, pages } = await productShelfService.getAllProductShelves(req.query);
    res.status(200).json({ success: true, count: productShelves.length, total, page, pages, data: productShelves });
  } catch (error) { next(error); }
};

/** @route GET /api/product-shelves/stats */
exports.getProductShelfStats = async (req, res, next) => {
  try {
    const data = await productShelfService.getProductShelfStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-shelves/:id */
exports.getProductShelfById = async (req, res, next) => {
  try {
    const data = await productShelfService.getProductShelfById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-shelves/product/:productId/shelves */
exports.getShelvesByProduct = async (req, res, next) => {
  try {
    const data = await productShelfService.getShelvesByProduct(req.params.productId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/product-shelves/shelf/:shelfId/products */
exports.getProductsByShelf = async (req, res, next) => {
  try {
    const { productShelves, total, page, pages, shelf } = await productShelfService.getProductsByShelf(req.params.shelfId, req.query);
    const shelf_info = shelf ? {
      shelf_number: shelf.shelf_number, shelf_name: shelf.shelf_name,
      section_number: shelf.section_number, capacity: shelf.capacity,
      current_quantity: shelf.current_quantity, available: shelf.capacity - shelf.current_quantity
    } : null;
    res.status(200).json({ success: true, count: productShelves.length, total, page, pages, shelf_info, data: productShelves });
  } catch (error) { next(error); }
};

/** @route POST /api/product-shelves */
exports.createProductShelf = async (req, res, next) => {
  try {
    const { productShelf, productName, shelfNumber } = await productShelfService.createProductShelf(req.body);
    logger.info(`Product shelf created successfully in controller: ${productShelf._id}`);
    res.status(201).json({
      success: true,
      message: `Successfully added ${req.body.quantity} units of ${productName} to shelf ${shelfNumber}`,
      data: productShelf
    });
  } catch (error) { next(error); }
};

/** @route PUT /api/product-shelves/:id */
exports.updateProductShelf = async (req, res, next) => {
  try {
    const data = await productShelfService.updateProductShelf(req.params.id, req.body);
    logger.info(`Product shelf updated successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product-shelf mapping updated successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/product-shelves/:id/move */
exports.moveProductToShelf = async (req, res, next) => {
  try {
    const { mapping, fromShelf, toShelf, quantity } = await productShelfService.moveProductToShelf(req.params.id, req.body.new_shelf_id);
    logger.info(`Product shelf moved successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: `Successfully moved ${quantity} units from ${fromShelf} to ${toShelf}`, data: mapping });
  } catch (error) { next(error); }
};

/** @route DELETE /api/product-shelves/:id */
exports.deleteProductShelf = async (req, res, next) => {
  try {
    const qty = await productShelfService.deleteProductShelf(req.params.id);
    logger.info(`Product shelf soft deleted successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: `Product removed from shelf. ${qty} units returned to warehouse.` });
  } catch (error) { next(error); }
};

/** @route POST /api/product-shelves/bulk/assign */
exports.bulkAssignToShelf = async (req, res, next) => {
  try {
    const { shelf_id, products } = req.body;
    const results = await productShelfService.bulkAssignToShelf(shelf_id, products);
    logger.info(`Bulk assigned successfully in controller. Success: ${results.success.length}, Errors: ${results.errors.length}`);
    res.status(results.errors.length > 0 ? 207 : 201).json({
      success: results.errors.length === 0,
      message: `Successfully assigned ${results.success.length} product(s). ${results.errors.length} error(s).`,
      data: results
    });
  } catch (error) { next(error); }
};

/** @route GET /api/product-shelves/for-damaged-record */
exports.getProductsForDamagedRecord = async (req, res, next) => {
  try {
    const { data, total, page, pages } = await productShelfService.getProductsForDamagedRecord(req.query);
    res.status(200).json({ success: true, count: data.length, total, page, pages, data });
  } catch (error) { next(error); }
};
