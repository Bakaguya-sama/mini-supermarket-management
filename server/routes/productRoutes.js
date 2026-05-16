const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRoles } = require('../middleware/auth');

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

// Protected Routes
router.use(authenticate);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin, Manager)
router.post('/', requireRoles(['admin', 'manager']), productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin, Manager)
router.put('/:id', requireRoles(['admin', 'manager']), productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Admin, Manager)
router.delete('/:id', requireRoles(['admin', 'manager']), productController.deleteProduct);

// @route   DELETE /api/products/:id/permanent
// @desc    Permanently delete product
// @access  Private (Admin)
router.delete('/:id/permanent', requireRoles(['admin']), productController.permanentDeleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin, Manager)
router.patch('/:id/stock', requireRoles(['admin', 'manager']), productController.updateProductStock);

// @route   PATCH /api/products/:id/price
// @desc    Update product price
// @access  Private (Admin, Manager)
router.patch('/:id/price', requireRoles(['admin', 'manager']), productController.updateProductPrice);

// @route   PATCH /api/products/:id/activate
// @desc    Activate product
// @access  Private (Admin, Manager)
router.patch('/:id/activate', requireRoles(['admin', 'manager']), productController.activateProduct);

// @route   GET /api/products/supplier/:supplierId
// @desc    Get products by supplier
// @access  Public
router.get('/supplier/:supplierId', productController.getProductsBySupplier);

module.exports = router;