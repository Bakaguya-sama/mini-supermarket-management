// routes/authRoutes.js - Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/auth/register/customer
 * @desc    Đăng ký tài khoản khách hàng
 * @access  Public
 */
router.post('/register/customer', authController.registerCustomer);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập (tất cả user types)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Xác thực token
 * @access  Public
 */
router.post('/verify-token', authController.verifyToken);

// ==================== PROTECTED ROUTES ====================

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Cập nhật thông tin cá nhân
 * @access  Private
 */
router.put('/update-profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
router.put('/change-password', authenticate, authController.changePassword);

// ==================== ADMIN/MANAGER ONLY ROUTES ====================

/**
 * @route   POST /api/auth/register/staff
 * @desc    Đăng ký tài khoản nhân viên (chỉ admin/manager)
 * @access  Private (Admin/Manager only)
 */
router.post('/register/staff', authenticate, authController.registerStaff);

module.exports = router;
