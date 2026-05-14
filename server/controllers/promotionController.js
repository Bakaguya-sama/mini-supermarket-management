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
    const { code, subtotal } = req.body;
    const data = await promotionService.validatePromoCode(code, subtotal);
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
