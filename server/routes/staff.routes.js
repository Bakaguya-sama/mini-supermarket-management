// server/routes/staff.routes.js
const express = require('express');
const staffController = require('../controllers/staff.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { validateStaff, validatePassword } = require('../middleware/validation.middleware');

const router = express.Router();

// ==================== PUBLIC ROUTES (if needed for registration) ====================
// Có thể loại bỏ nếu chỉ admin tạo staff

// ==================== PROTECTED ROUTES ====================

// GET all staff (Manager, Admin)
router.get('/', 
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  staffController.getAllStaff
);

// GET staff statistics
router.get('/statistics/overview',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  staffController.getStaffStatistics
);

// GET staff by position (Manager, Admin)
router.get('/position/:position',
  authenticateToken,
  authorizeRole(['manager', 'admin']),
  staffController.getStaffByPosition
);

// GET staff by ID (Manager, Admin, or own profile)
router.get('/:id',
  authenticateToken,
  authorizeRole(['manager', 'admin', 'staff']),
  staffController.getStaffById
);

// POST create new staff (Admin only)
router.post('/',
  authenticateToken,
  authorizeRole(['admin']),
  validateStaff,
  staffController.createStaff
);

// PUT update staff (Admin, Manager)
router.put('/:id',
  authenticateToken,
  authorizeRole(['admin', 'manager']),
  staffController.updateStaff
);

// DELETE staff (Admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRole(['admin']),
  staffController.deleteStaff
);

// PUT change password (Self or Admin)
router.put('/:id/change-password',
  authenticateToken,
  validatePassword,
  staffController.changePassword
);

module.exports = router;
