// server/controllers/invoiceController.js
const invoiceService = require('../services/InvoiceService');
const logger = require('../config/logger');

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with filters
 * @access  Public
 */
/**
 * @openapi
 * /api/invoices/:
 *   get:
 *     tags: [invoice]
 *     summary: get All Invoices
 *     operationId: getAllInvoices
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/{id}:
 *   get:
 *     tags: [invoice]
 *     summary: get Invoice By Id
 *     operationId: getInvoiceById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/customer/{customerId}:
 *   get:
 *     tags: [invoice]
 *     summary: get Invoices By Customer
 *     operationId: getInvoicesByCustomer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/stats:
 *   get:
 *     tags: [invoice]
 *     summary: get Invoice Stats
 *     operationId: getInvoiceStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/:
 *   post:
 *     tags: [invoice]
 *     summary: create Invoice
 *     operationId: createInvoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/{id}:
 *   put:
 *     tags: [invoice]
 *     summary: update Invoice
 *     operationId: updateInvoice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/{id}/mark-paid:
 *   patch:
 *     tags: [invoice]
 *     summary: mark As Paid
 *     operationId: markAsPaid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/filter/unpaid:
 *   get:
 *     tags: [invoice]
 *     summary: get Unpaid Invoices
 *     operationId: getUnpaidInvoices
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/invoices/{id}:
 *   delete:
 *     tags: [invoice]
 *     summary: delete Invoice
 *     operationId: deleteInvoice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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

