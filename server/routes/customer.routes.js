// server/routes/customer.routes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { validatePagination } = require('../middleware/validation.middleware');

// Public routes
router.get('/statistics', customerController.getCustomerStatistics);

// Protected routes
router.get('/', authenticateToken, validatePagination, customerController.getAllCustomers);
router.get('/membership/:membershipType', authenticateToken, customerController.getCustomersByMembership);
router.get('/account/:accountId', authenticateToken, customerController.getCustomerByAccountId);
router.get('/:id', authenticateToken, customerController.getCustomerById);

// Admin only
router.post('/', authenticateToken, authorizeRole(['admin', 'manager']), customerController.createCustomer);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'manager']), customerController.updateCustomer);
router.put('/:id/points', authenticateToken, authorizeRole(['admin', 'manager']), customerController.updatePoints);
router.put('/:id/spent', authenticateToken, authorizeRole(['admin', 'manager']), customerController.updateTotalSpent);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), customerController.deleteCustomer);

module.exports = router;
