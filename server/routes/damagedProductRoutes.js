// routes/damagedProductRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllDamagedProducts,
  getDamagedProductStats,
  getDamagedProductById,
  getDamagedProductsByProductId,
  createDamagedProduct,
  updateDamagedProduct,
  adjustInventoryForDamaged,
  deleteDamagedProduct,
  getDamagedProductShelves,
  bulkUpdateStatus
} = require('../controllers/damagedProductController');

// Stats and bulk operations (must be before :id routes)
router.get('/stats', getDamagedProductStats);
router.put('/bulk/update-status', bulkUpdateStatus);

// Product-specific routes
router.get('/product/:productId', getDamagedProductsByProductId);

// Main CRUD routes
router.route('/')
  .get(getAllDamagedProducts)
  .post(createDamagedProduct);

router.route('/:id')
  .get(getDamagedProductById)
  .put(updateDamagedProduct)
  .delete(deleteDamagedProduct);

// Special action routes
router.put('/:id/adjust-inventory', adjustInventoryForDamaged);
router.get('/:id/shelves', getDamagedProductShelves);

module.exports = router;
