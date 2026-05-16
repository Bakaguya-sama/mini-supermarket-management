// controllers/promotionController.js
const promotionService = require('../services/PromotionService');
const logger = require('../config/logger');

/** @route GET /api/promotions */
exports.getAllPromotions = async (req, res, next) => {
  try {
    const data = await promotionService.getAllPromotions(req.query);
    res.json({ success: true, data, total: data.length });
  } catch (error) { next(error); }
};

/** @route GET /api/promotions/:id */
exports.getPromotionById = async (req, res, next) => {
  try {
    const data = await promotionService.getPromotionById(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/promotions/validate */
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
exports.getApplicablePromotions = async (req, res, next) => {
  try {
    const data = await promotionService.getApplicablePromotions(req.query.subtotal);
    res.json({ success: true, data, total: data.length });
  } catch (error) { next(error); }
};

/** @route POST /api/promotions */
exports.createPromotion = async (req, res, next) => {
  try {
    const data = await promotionService.createPromotion(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route PUT /api/promotions/:id */
exports.updatePromotion = async (req, res, next) => {
  try {
    const data = await promotionService.updatePromotion(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/promotions/:id */
exports.deletePromotion = async (req, res, next) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) { next(error); }
};
