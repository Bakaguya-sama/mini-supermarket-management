// server/routes/invoice.routes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { validatePagination } = require('../middleware/validation.middleware');

// Public statistics
router.get('/statistics', invoiceController.getInvoiceStatistics);

// Protected routes
router.get('/', authenticateToken, validatePagination, invoiceController.getAllInvoices);
router.get('/customer/:customerId', authenticateToken, validatePagination, invoiceController.getInvoicesByCustomer);
router.get('/order/:orderId', authenticateToken, invoiceController.getInvoicesByOrder);
router.get('/:id', authenticateToken, invoiceController.getInvoiceById);

// Admin only
router.post('/', authenticateToken, authorizeRole(['admin', 'manager']), invoiceController.createInvoice);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'manager']), invoiceController.updateInvoice);
router.put('/:id/status', authenticateToken, authorizeRole(['admin', 'manager']), invoiceController.updatePaymentStatus);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), invoiceController.deleteInvoice);

module.exports = router;
