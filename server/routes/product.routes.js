// server/routes/product.routes.js
const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// GET all products (public)
router.get('/', productController.getAllProducts);

// GET product by ID (public)
router.get('/:id', productController.getProductById);

// GET products by category (public)
router.get('/category/:category', productController.getProductsByCategory);

// ==================== PROTECTED ROUTES ====================

// GET low stock products (Manager, Admin)
router.get('/stock/low',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  productController.getLowStockProducts
);

// GET product statistics (Manager, Admin)
router.get('/statistics/overview',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  productController.getProductStatistics
);

// POST create product (Admin)
router.post('/',
  authenticateToken,
  authorizeRole(['admin']),
  productController.createProduct
);

// PUT update product (Admin, Manager)
router.put('/:id',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  productController.updateProduct
);

// PUT update stock (Admin, Manager, Warehouse)
router.put('/:id/stock',
  authenticateToken,
  authorizeRole(['admin', 'manager', 'staff']),
  productController.updateStock
);

// DELETE product (Admin)
router.delete('/:id',
  authenticateToken,
  authorizeRole(['admin']),
  productController.deleteProduct
);

module.exports = router;
