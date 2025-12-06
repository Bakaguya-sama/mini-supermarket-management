// server/routes/supplier.routes.js
const express = require('express');
const supplierController = require('../controllers/supplier.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// GET all suppliers
router.get('/', supplierController.getAllSuppliers);

// GET supplier by ID
router.get('/:id', supplierController.getSupplierById);

// GET active suppliers only
router.get('/active/list', supplierController.getActiveSuppliers);

// ==================== PROTECTED ROUTES ====================

// GET supplier statistics (Manager, Admin)
router.get('/statistics/overview',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  supplierController.getSupplierStatistics
);

// POST create supplier (Admin)
router.post('/',
  authenticateToken,
  authorizeRole(['admin']),
  supplierController.createSupplier
);

// PUT update supplier (Admin, Manager)
router.put('/:id',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  supplierController.updateSupplier
);

// DELETE supplier (Admin)
router.delete('/:id',
  authenticateToken,
  authorizeRole(['admin']),
  supplierController.deleteSupplier
);

module.exports = router;
