// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/products
// @desc    Get all products with filters and pagination
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Public
router.get('/stats', productController.getProductStats);

// @route   GET /api/products/low-stock
// @desc    Get products with low stock
// @access  Public
router.get('/low-stock', productController.getLowStockProducts);

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', productController.getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Public
router.post('/', productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Public
router.put('/:id', productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete - set status to discontinued)
// @access  Public
router.delete('/:id', productController.deleteProduct);

// @route   DELETE /api/products/:id/permanent
// @desc    Permanently delete product
// @access  Public
router.delete('/:id/permanent', productController.permanentDeleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Public
router.patch('/:id/stock', productController.updateProductStock);

// @route   PATCH /api/products/:id/price
// @desc    Update product price
// @access  Public
router.patch('/:id/price', productController.updateProductPrice);

// @route   PATCH /api/products/:id/activate
// @desc    Activate product (set status to active)
// @access  Public
router.patch('/:id/activate', productController.activateProduct);

// @route   GET /api/products/supplier/:supplierId
// @desc    Get products by supplier
// @access  Public
router.get('/supplier/:supplierId', productController.getProductsBySupplier);

// ==================== BATCH MANAGEMENT ROUTES ====================

// @route   POST /api/products/:id/export
// @desc    Export/Reduce product quantity with FIFO logic
// @access  Public
router.post('/:id/export', productController.exportProduct);

// @route   GET /api/products/:id/batches
// @desc    Get product batches sorted by expiry date
// @access  Public
router.get('/:id/batches', productController.getProductBatches);

// @route   PATCH /api/products/:id/batches/:batchIndex
// @desc    Update specific batch
// @access  Public
router.patch('/:id/batches/:batchIndex', productController.updateBatch);

// @route   DELETE /api/products/:id/batches/:batchIndex
// @desc    Delete specific batch
// @access  Public
router.delete('/:id/batches/:batchIndex', productController.deleteBatch);

module.exports = router;