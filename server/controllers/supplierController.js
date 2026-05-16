// server/controllers/supplierController.js
const supplierService = require('../services/SupplierService');
const logger = require('../config/logger');

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with filters and pagination
 * @access  Public
 */
exports.getAllSuppliers = async (req, res, next) => {
  try {
    const { suppliers, total, page, pages } = await supplierService.getAllSuppliers(req.query);
    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      page,
      pages,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/suppliers/stats
 * @desc    Get supplier statistics
 * @access  Public
 */
exports.getSupplierStats = async (req, res, next) => {
  try {
    const stats = await supplierService.getSupplierStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/suppliers/active
 * @desc    Get all active suppliers
 * @access  Public
 */
exports.getActiveSuppliers = async (req, res, next) => {
  try {
    const suppliers = await supplierService.getActiveSuppliers();
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get single supplier by ID
 * @access  Public
 */
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/suppliers/:id/products
 * @desc    Get all products from a supplier
 * @access  Public
 */
exports.getSupplierProducts = async (req, res, next) => {
  try {
    const result = await supplierService.getSupplierProducts(req.params.id, req.query);
    res.status(200).json({
      success: true,
      supplier: result.supplier,
      count: result.products.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/suppliers
 * @desc    Create new supplier
 * @access  Public
 */
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update supplier
 * @access  Public
 */
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Soft delete supplier
 * @access  Public
 */
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.deleteSupplier(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Supplier marked as deleted successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/suppliers/:id/permanent
 * @desc    Permanently delete supplier
 * @access  Public
 */
exports.permanentDeleteSupplier = async (req, res, next) => {
  try {
    const result = await supplierService.permanentDeleteSupplier(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/suppliers/:id/activate
 * @desc    Activate supplier
 * @access  Public
 */
exports.activateSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.activateSupplier(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Supplier activated successfully',
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};
