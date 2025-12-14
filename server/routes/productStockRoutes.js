// routes/productStockRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllProductStocks,
  getProductStockStats,
  getProductStockById,
  getStockByProduct,
  getStockByShelf,
  getLowStockProducts,
  createProductStock,
  updateProductStock,
  adjustStockQuantity,
  deleteProductStock,
  bulkUpdateStatus
} = require('../controllers/productStockController');

// Stats and special routes (must be before :id routes)
router.get('/stats', getProductStockStats);
router.get('/low-stock', getLowStockProducts);
router.put('/bulk/update-status', bulkUpdateStatus);

// Nested resource routes
router.get('/product/:productId', getStockByProduct);
router.get('/shelf/:shelfId', getStockByShelf);

// Main CRUD routes
router.route('/')
  .get(getAllProductStocks)
  .post(createProductStock);

router.route('/:id')
  .get(getProductStockById)
  .put(updateProductStock)
  .delete(deleteProductStock);

// Special action routes
router.put('/:id/adjust', adjustStockQuantity);

module.exports = router;
