// server/routes/order.routes.js
const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// GET all orders (requires auth)
router.get('/',
  authenticateToken,
  orderController.getAllOrders
);

// GET order by ID (requires auth)
router.get('/:id',
  authenticateToken,
  orderController.getOrderById
);

// ==================== CUSTOMER ROUTES ====================
// GET customer orders
router.get('/customer/:customerId',
  authenticateToken,
  orderController.getCustomerOrders
);

// ==================== PROTECTED ROUTES ====================

// GET orders by status (Manager, Admin, Staff)
router.get('/status/:status',
  authenticateToken,
  authorizeRole(['manager', 'admin', 'staff']),
  orderController.getOrdersByStatus
);

// GET order statistics (Manager, Admin)
router.get('/statistics/overview',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  orderController.getOrderStatistics
);

// POST create order (Admin, Staff, Customer)
router.post('/',
  authenticateToken,
  orderController.createOrder
);

// PUT update order (Manager, Admin)
router.put('/:id',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  orderController.updateOrder
);

// PUT update order status (Manager, Admin, Staff)
router.put('/:id/status',
  authenticateToken,
  authorizeRole(['manager', 'admin', 'staff']),
  orderController.updateOrderStatus
);

// DELETE order (Admin)
router.delete('/:id',
  authenticateToken,
  authorizeRole(['admin']),
  orderController.deleteOrder
);

module.exports = router;
