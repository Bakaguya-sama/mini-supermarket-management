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

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Gửi mã xác thực để reset password
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Xác thực mã và reset password
 * @access  Public
 */
router.post('/verify-reset-code', authController.verifyResetCode);

/**
 * @route   POST /api/auth/resend-verification-code
 * @desc    Gửi lại mã xác thực
 * @access  Public
 */
router.post('/resend-verification-code', authController.resendVerificationCode);

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

/**
 * @route   POST /api/auth/reset-password-for-customer
 * @desc    Reset password cho customer (Admin/Manager only)
 * @access  Private (Admin/Manager)
 */
router.post('/reset-password-for-customer', authenticate, authController.resetPasswordForCustomer);

module.exports = router;
