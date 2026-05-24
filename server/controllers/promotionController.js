// controllers/promotionController.js
const promotionService = require('../services/PromotionService');
const logger = require('../config/logger');

/** @route GET /api/promotions */
/**
 * @openapi
 * /api/promotions/:
 *   get:
 *     tags: [promotion]
 *     summary: get All Promotions
 *     operationId: getAllPromotions
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getAllPromotions = async (req, res, next) => {
  try {
    const data = await promotionService.getAllPromotions(req.query);
    res.json({ success: true, data, total: data.length });
  } catch (error) { next(error); }
};

/** @route GET /api/promotions/:id */
/**
 * @openapi
 * /api/promotions/{id}:
 *   get:
 *     tags: [promotion]
 *     summary: get Promotion By Id
 *     operationId: getPromotionById
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
exports.getPromotionById = async (req, res, next) => {
  try {
    const data = await promotionService.getPromotionById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/promotions/validate */
/**
 * @openapi
 * /api/promotions/validate:
 *   post:
 *     tags: [promotion]
 *     summary: validate Promo Code
 *     operationId: validatePromoCode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.validatePromoCode = async (req, res, next) => {
  try {
    const { code, promo_code, subtotal } = req.method === 'GET' ? req.query : req.body;
    const finalCode = code || promo_code;
    const data = await promotionService.validatePromoCode(finalCode, subtotal);
    logger.info(`Promo code validated successfully in controller: ${code}`);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/promotions/applicable */
/**
 * @openapi
 * /api/promotions/applicable:
 *   get:
 *     tags: [promotion]
 *     summary: get Applicable Promotions
 *     operationId: getApplicablePromotions
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getApplicablePromotions = async (req, res, next) => {
  try {
    const data = await promotionService.getApplicablePromotions(req.query.subtotal);
    res.json({ success: true, data, total: data.length });
  } catch (error) { next(error); }
};

/** @route POST /api/promotions */
/**
 * @openapi
 * /api/promotions/:
 *   post:
 *     tags: [promotion]
 *     summary: create Promotion
 *     operationId: createPromotion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.createPromotion = async (req, res, next) => {
  try {
    const data = await promotionService.createPromotion(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route PUT /api/promotions/:id */
/**
 * @openapi
 * /api/promotions/{id}:
 *   put:
 *     tags: [promotion]
 *     summary: update Promotion
 *     operationId: updatePromotion
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
exports.updatePromotion = async (req, res, next) => {
  try {
    const data = await promotionService.updatePromotion(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/promotions/:id */
/**
 * @openapi
 * /api/promotions/{id}:
 *   delete:
 *     tags: [promotion]
 *     summary: delete Promotion
 *     operationId: deletePromotion
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
exports.deletePromotion = async (req, res, next) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) { next(error); }
};

