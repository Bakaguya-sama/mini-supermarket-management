// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// @route   GET /api/staff
// @desc    Get all staff with filters and pagination
// @access  Public (should be protected in production)
router.get('/', staffController.getAllStaff);

// SPECIFIC ROUTES MUST COME BEFORE DYNAMIC ROUTES (:id)
// @route   GET /api/staff/stats
// @desc    Get staff statistics
// @access  Public
router.get('/stats', staffController.getStaffStats);

// @route   GET /api/staff/account/:accountId
// @desc    Get staff by account ID
// @access  Public
router.get('/account/:accountId', staffController.getStaffByAccountId);

// DYNAMIC ROUTES - MUST BE LAST
// @route   GET /api/staff/:id
// @desc    Get single staff by ID
// @access  Public
router.get('/:id', staffController.getStaffById);

// @route   POST /api/staff
// @desc    Create new staff (with account)
// @access  Public
router.post('/', staffController.createStaff);

// @route   PUT /api/staff/:id
// @desc    Update staff
// @access  Public
router.put('/:id', staffController.updateStaff);

// @route   DELETE /api/staff/:id
// @desc    Soft delete staff (set is_active = false)
// @access  Public
router.delete('/:id', staffController.deleteStaff);

// @route   DELETE /api/staff/:id/permanent
// @desc    Permanently delete staff and related account
// @access  Public
router.delete('/:id/permanent', staffController.permanentDeleteStaff);

// @route   PATCH /api/staff/:id/activate
// @desc    Activate staff
// @access  Public
router.patch('/:id/activate', staffController.activateStaff);

module.exports = router;