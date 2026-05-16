// server/routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// Get all promotions (with filters)
router.get('/', promotionController.getAllPromotions);

// Validate promo code
router.post('/validate', promotionController.validatePromoCode);

// Get applicable promotions for current cart subtotal
router.get('/applicable', promotionController.getApplicablePromotions);

// Get promotion by ID
router.get('/:id', promotionController.getPromotionById);

// CRUD
router.post('/', promotionController.createPromotion);
router.put('/:id', promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
