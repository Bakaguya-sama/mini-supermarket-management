// routes/productShelfRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllProductShelves,
  getProductShelfStats,
  getProductShelfById,
  getShelvesByProduct,
  getProductsByShelf,
  createProductShelf,
  updateProductShelf,
  moveProductToShelf,
  deleteProductShelf,
  bulkAssignToShelf
} = require('../controllers/productShelfController');

// Stats and bulk operations (must be before :id routes)
router.get('/stats', getProductShelfStats);
router.post('/bulk/assign', bulkAssignToShelf);

// Nested resource routes
router.get('/product/:productId/shelves', getShelvesByProduct);
router.get('/shelf/:shelfId/products', getProductsByShelf);

// Main CRUD routes
router.route('/')
  .get(getAllProductShelves)
  .post(createProductShelf);

router.route('/:id')
  .get(getProductShelfById)
  .put(updateProductShelf)
  .delete(deleteProductShelf);

// Special action routes
router.put('/:id/move', moveProductToShelf);

module.exports = router;
