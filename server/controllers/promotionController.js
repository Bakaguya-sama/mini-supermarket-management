// server/controllers/promotionController.js
const { Promotion, PromotionProduct } = require('../models');

/**
 * GET /api/promotions - Get all active promotions
 */
const getAllPromotions = async (req, res) => {
  try {
    const { status = 'active', includeExpired = false } = req.query;
    
    const query = { isDelete: false };
    
    if (status) {
      query.status = status;
    }

    // Filter by date if not including expired
    if (!includeExpired) {
      const now = new Date();
      query.end_date = { $gte: now };
    }

    const promotions = await Promotion.find(query)
      .sort({ start_date: -1 })
      .lean();

    // Format promotions for frontend
    const formattedPromotions = promotions.map(promo => ({
      id: promo._id,
      name: promo.name,
      code: promo.promo_code,
      description: promo.description,
      type: promo.promotion_type, // 'percentage' or 'fixed'
      discountValue: promo.discount_value,
      minPurchase: promo.minimum_purchase_amount || 0,
      startDate: promo.start_date,
      endDate: promo.end_date,
      status: promo.status,
      terms: promo.terms
    }));

    res.json({
      success: true,
      data: formattedPromotions,
      total: formattedPromotions.length
    });
  } catch (error) {
    console.error('❌ Error getting promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotions',
      error: error.message
    });
  }
};

/**
 * GET /api/promotions/:id - Get promotion by ID
 */
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findOne({
      _id: id,
      isDelete: false
    }).lean();

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Get associated products
    const promoProducts = await PromotionProduct.find({
      promotion_id: id,
      isDelete: false
    })
      .populate('product_id')
      .lean();

    res.json({
      success: true,
      data: {
        ...promotion,
        applicableProducts: promoProducts.map(pp => ({
          productId: pp.product_id._id,
          productName: pp.product_id.name,
          discountOverride: pp.discount_override
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error getting promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotion',
      error: error.message
    });
  }
};

/**
 * POST /api/promotions/validate - Validate promo code
 */
const validatePromoCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const promotion = await Promotion.findOne({
      promo_code: code.trim().toUpperCase(),
      isDelete: false,
      status: 'active'
    }).lean();

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check if promotion is within valid date range
    const now = new Date();
    if (now < new Date(promotion.start_date) || now > new Date(promotion.end_date)) {
      return res.status(400).json({
        success: false,
        message: 'This promotion is not currently active'
      });
    }

    // Check minimum purchase requirement
    if (subtotal < (promotion.minimum_purchase_amount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of $${promotion.minimum_purchase_amount.toFixed(2)} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.promotion_type === 'percentage') {
      discountAmount = (subtotal * promotion.discount_value) / 100;
    } else if (promotion.promotion_type === 'fixed') {
      discountAmount = promotion.discount_value;
    }

    res.json({
      success: true,
      data: {
        id: promotion._id,
        code: promotion.promo_code,
        name: promotion.name,
        description: promotion.description,
        type: promotion.promotion_type,
        discountValue: promotion.discount_value,
        discountAmount: Math.min(discountAmount, subtotal), // Can't exceed subtotal
        minPurchase: promotion.minimum_purchase_amount || 0
      }
    });
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
};

/**
 * GET /api/promotions/applicable - Get applicable promotions for cart
 */
const getApplicablePromotions = async (req, res) => {
  try {
    const { subtotal = 0 } = req.query;
    const subtotalAmount = parseFloat(subtotal);

    const now = new Date();
    
    const promotions = await Promotion.find({
      isDelete: false,
      status: 'active',
      start_date: { $lte: now },
      end_date: { $gte: now },
      minimum_purchase_amount: { $lte: subtotalAmount }
    })
      .sort({ discount_value: -1 }) // Sort by discount value (best first)
      .lean();

    const formattedPromotions = promotions.map(promo => {
      let discountAmount = 0;
      if (promo.promotion_type === 'percentage') {
        discountAmount = (subtotalAmount * promo.discount_value) / 100;
      } else if (promo.promotion_type === 'fixed') {
        discountAmount = promo.discount_value;
      }

      return {
        id: promo._id,
        name: promo.name,
        code: promo.promo_code,
        description: promo.description,
        type: promo.promotion_type,
        discountValue: promo.discount_value,
        discountAmount: Math.min(discountAmount, subtotalAmount),
        minPurchase: promo.minimum_purchase_amount || 0,
        startDate: promo.start_date,
        endDate: promo.end_date,
        terms: promo.terms
      };
    });

    res.json({
      success: true,
      data: formattedPromotions,
      total: formattedPromotions.length
    });
  } catch (error) {
    console.error('❌ Error getting applicable promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applicable promotions',
      error: error.message
    });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  validatePromoCode,
  getApplicablePromotions
};
