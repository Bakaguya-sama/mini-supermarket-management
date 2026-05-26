// controllers/productBatchController.js
const productBatchService = require('../services/ProductBatchService');
const logger = require('../config/logger');

/**
 * @route   POST /api/product-batches
 * @desc    Tạo lô hàng mới và cập nhật tồn kho
 * @access  Private
 */
exports.createBatch = async (req, res, next) => {
  try {
    const batch = await productBatchService.createBatch(req.body);
    logger.info(`Batch created successfully in controller: ${batch._id}`);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/product-batches
 * @desc    Lấy danh sách lô hàng (có filter, phân trang)
 * @access  Private
 */
exports.getAllBatches = async (req, res, next) => {
  try {
    const { batches, total, page, pages } = await productBatchService.getAllBatches(req.query);
    res.status(200).json({ success: true, count: batches.length, total, page, pages, data: batches });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/product-batches/:id
 * @desc    Lấy chi tiết một lô hàng
 * @access  Private
 */
exports.getBatchById = async (req, res, next) => {
  try {
    const batch = await productBatchService.getBatchById(req.params.id);
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/product-batches/product/:productId
 * @desc    Lấy tất cả lô hàng của một sản phẩm
 * @access  Private
 */
/**
 * @openapi
 * /api/product-batches/product/{productId}:
 *   get:
 *     tags: [productBatch]
 *     summary: get Batches By Product
 *     operationId: getBatchesByProduct
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
exports.getBatchesByProduct = async (req, res, next) => {
  try {
    const result = await productBatchService.getBatchesByProduct(req.params.productId, req.query);
    res.status(200).json({ success: true, count: result.batches.length, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/product-batches/:id
 * @desc    Cập nhật lô hàng
 * @access  Private
 */
exports.updateBatch = async (req, res, next) => {
  try {
    const batch = await productBatchService.updateBatch(req.params.id, req.body);
    logger.info(`Batch updated successfully in controller: ${batch._id}`);
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/product-batches/:id/adjust
 * @desc    Điều chỉnh số lượng lô hàng theo delta
 * @access  Private
 */
/**
 * @openapi
 * /api/product-batches/{id}/adjust:
 *   put:
 *     tags: [productBatch]
 *     summary: adjust Batch Quantity
 *     operationId: adjustBatchQuantity
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
exports.adjustBatchQuantity = async (req, res, next) => {
  try {
    const { delta } = req.body;
    const batch = await productBatchService.adjustBatchQuantity(req.params.id, delta);
    logger.info(`Batch quantity adjusted successfully in controller: ${batch._id}`);
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/product-batches/:id
 * @desc    Soft delete lô hàng và hoàn trả tồn kho
 * @access  Private
 */
exports.deleteBatch = async (req, res, next) => {
  try {
    await productBatchService.deleteBatch(req.params.id);
    logger.info(`Batch soft deleted successfully in controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Batch deleted (soft)' });
  } catch (error) {
    next(error);
  }
};

