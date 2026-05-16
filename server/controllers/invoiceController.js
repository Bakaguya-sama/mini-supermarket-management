// server/controllers/invoiceController.js
const invoiceService = require('../services/InvoiceService');
const logger = require('../config/logger');

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with filters
 * @access  Public
 */
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { invoices, total, page, pages } = await invoiceService.getAllInvoices(req.query);
    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/:id
 * @desc    Get single invoice by ID
 * @access  Public
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/customer/:customerId
 * @desc    Get invoices by customer
 * @access  Public
 */
exports.getInvoicesByCustomer = async (req, res, next) => {
  try {
    const { invoices, total, page, pages } = await invoiceService.getInvoicesByCustomer(req.params.customerId, req.query);
    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/stats/summary
 * @desc    Get invoice statistics
 * @access  Public
 */
exports.getInvoiceStats = async (req, res, next) => {
  try {
    const stats = await invoiceService.getInvoiceStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/invoices
 * @desc    Create new invoice
 * @access  Public
 */
exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice
 * @access  Public
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/invoices/:id/mark-paid
 * @desc    Mark invoice as paid
 * @access  Public
 */
exports.markAsPaid = async (req, res, next) => {
  try {
    const { invoice, warnings } = await invoiceService.markAsPaid(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice,
      warnings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/invoices/filter/unpaid
 * @desc    Get unpaid invoices
 * @access  Public
 */
exports.getUnpaidInvoices = async (req, res, next) => {
  try {
    const { invoices, total, page, pages } = await invoiceService.getUnpaidInvoices(req.query);
    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice (soft delete)
 * @access  Public
 */
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.deleteInvoice(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};
