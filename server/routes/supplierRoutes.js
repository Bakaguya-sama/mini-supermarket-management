// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// @route   GET /api/suppliers
// @desc    Get all suppliers with filters and pagination
// @access  Public
router.get('/', supplierController.getAllSuppliers);

// @route   GET /api/suppliers/stats
// @desc    Get supplier statistics
// @access  Public
router.get('/stats', supplierController.getSupplierStats);

// @route   GET /api/suppliers/active
// @desc    Get all active suppliers
// @access  Public
router.get('/active', supplierController.getActiveSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get single supplier by ID
// @access  Public
router.get('/:id', supplierController.getSupplierById);

// @route   GET /api/suppliers/:id/products
// @desc    Get all products from a supplier
// @access  Public
router.get('/:id/products', supplierController.getSupplierProducts);

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Public
router.post('/', supplierController.createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Public
router.put('/:id', supplierController.updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Soft delete supplier (set is_active = false)
// @access  Public
router.delete('/:id', supplierController.deleteSupplier);

// @route   DELETE /api/suppliers/:id/permanent
// @desc    Permanently delete supplier
// @access  Public
router.delete('/:id/permanent', supplierController.permanentDeleteSupplier);

// @route   PATCH /api/suppliers/:id/activate
// @desc    Activate supplier
// @access  Public
router.patch('/:id/activate', supplierController.activateSupplier);

module.exports = router;