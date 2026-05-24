// controllers/damagedProductController.js
const damagedProductService = require('../services/DamagedProductService');
const logger = require('../config/logger');

/** @route GET /api/damaged-products */
exports.getAllDamagedProducts = async (req, res, next) => {
  try {
    const { damagedProducts, total, page, pages } = await damagedProductService.getAllDamagedProducts(req.query);
    res.status(200).json({ success: true, count: damagedProducts.length, total, page, pages, data: damagedProducts });
  } catch (error) { next(error); }
};

/** @route GET /api/damaged-products/stats */
/**
 * @openapi
 * /api/damaged-products/stats:
 *   get:
 *     tags: [damagedProduct]
 *     summary: get Damaged Product Stats
 *     operationId: getDamagedProductStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getDamagedProductStats = async (req, res, next) => {
  try {
    const data = await damagedProductService.getDamagedProductStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/damaged-products/:id */
exports.getDamagedProductById = async (req, res, next) => {
  try {
    const data = await damagedProductService.getDamagedProductById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/damaged-products/product/:productId */
/**
 * @openapi
 * /api/damaged-products/product/{productId}:
 *   get:
 *     tags: [damagedProduct]
 *     summary: get Damaged Products By Product Id
 *     operationId: getDamagedProductsByProductId
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getDamagedProductsByProductId = async (req, res, next) => {
  try {
    const data = await damagedProductService.getDamagedProductsByProductId(req.params.productId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

/** @route POST /api/damaged-products */
exports.createDamagedProduct = async (req, res, next) => {
  try {
    const data = await damagedProductService.createDamagedProduct(req.body);
    logger.info(`Damaged product reported successfully via controller: ${data._id}`);
    res.status(201).json({
      success: true,
      message: req.body.shelf_id 
        ? `Damaged product reported. Deducted ${req.body.damaged_quantity} units from shelf.`
        : 'Damaged product report created successfully (no shelf specified)',
      data
    });
  } catch (error) { next(error); }
};

/** @route PUT /api/damaged-products/:id */
exports.updateDamagedProduct = async (req, res, next) => {
  try {
    const data = await damagedProductService.updateDamagedProduct(req.params.id, req.body);
    logger.info(`Damaged product report updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Damaged product information updated successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/damaged-products/:id/adjust-inventory */
/**
 * @openapi
 * /api/damaged-products/{id}/adjust-inventory:
 *   put:
 *     tags: [damagedProduct]
 *     summary: adjust Inventory For Damaged
 *     operationId: adjustInventoryForDamaged
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.adjustInventoryForDamaged = async (req, res, next) => {
  try {
    const data = await damagedProductService.adjustInventoryForDamaged(req.params.id);
    logger.info(`Inventory adjusted for damaged product via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Warehouse inventory adjusted successfully (shelf was already deducted)', data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/damaged-products/:id */
exports.deleteDamagedProduct = async (req, res, next) => {
  try {
    await damagedProductService.deleteDamagedProduct(req.params.id);
    logger.info(`Damaged product record deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Damaged product record deleted successfully' });
  } catch (error) { next(error); }
};

/** @route GET /api/damaged-products/:id/shelves */
/**
 * @openapi
 * /api/damaged-products/{id}/shelves:
 *   get:
 *     tags: [damagedProduct]
 *     summary: get Damaged Product Shelves
 *     operationId: getDamagedProductShelves
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getDamagedProductShelves = async (req, res, next) => {
  try {
    const data = await damagedProductService.getDamagedProductShelves(req.params.id);
    res.status(200).json({ success: true, count: data.shelves.length, data });
  } catch (error) { next(error); }
};

/** @route PUT /api/damaged-products/bulk/update-status */
/**
 * @openapi
 * /api/damaged-products/bulk/update-status:
 *   put:
 *     tags: [damagedProduct]
 *     summary: bulk Update Status
 *     operationId: bulkUpdateStatus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const result = await damagedProductService.bulkUpdateStatus(req.body.ids, req.body.status);
    logger.info(`Bulk updated status for ${result.modifiedCount} damaged products via controller`);
    res.status(200).json({ success: true, message: `Updated ${result.modifiedCount} damaged product(s)`, data: { matched: result.matchedCount, modified: result.modifiedCount } });
  } catch (error) { next(error); }
};

