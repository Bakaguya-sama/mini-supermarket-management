// controllers/authController.js - Authentication Controller
const authService = require('../services/AuthService');
const logger = require('../config/logger');
const { traceLogin } = require('../middleware/tracing');

// ==================== REGISTER FUNCTIONS ====================

/**
 * @route   POST /api/auth/register/customer
 * @desc    Đăng ký tài khoản khách hàng mới
 * @access  Public
 */
/**
 * @openapi
 * /api/auth/register/customer:
 *   post:
 *     tags: [auth]
 *     summary: register Customer
 *     operationId: registerCustomer
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
exports.registerCustomer = async (req, res, next) => {
  try {
    const { token, account, customer } = await authService.registerCustomer(req.body);
    logger.info(`Customer registered successfully: ${account.email}`);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản khách hàng thành công',
      data: {
        token,
        user: {
          id: account._id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          role: account.role,
          customer_id: customer._id,
          membership_type: customer.membership_type,
          points_balance: customer.points_balance
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/register/staff
 * @desc    Đăng ký tài khoản nhân viên mới (chỉ admin/manager)
 * @access  Private (Admin/Manager only)
 */
/**
 * @openapi
 * /api/auth/register/staff:
 *   post:
 *     tags: [auth]
 *     summary: register Staff
 *     operationId: registerStaff
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
exports.registerStaff = async (req, res, next) => {
  try {
    const { account, staff } = await authService.registerStaff(req.body);
    logger.info(`Staff registered successfully: ${account.email}`);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản nhân viên thành công',
      data: {
        user: {
          id: account._id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          role: account.role,
          staff_id: staff._id,
          position: staff.position,
          employment_type: staff.employment_type
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== LOGIN FUNCTIONS ====================

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập cho tất cả loại user (customer, staff, admin)
 * @access  Public
 */
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [auth]
 *     summary: login
 *     operationId: login
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
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Trace login operation
    const { token, account, profile } = await traceLogin(
      username,
      req.ip,
      req.headers['user-agent'],
      async () => {
        return await authService.login(username, password);
      }
    );

    logger.info(`User logged in successfully: ${account.username}`);

    let userData = {
      id: account._id || account.id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      role: account.role
    };

    if (profile) {
      if (account.role === 'customer') {
        userData.customer_id = profile._id;
        userData.membership_type = profile.membership_type;
      } else if (account.role === 'staff' || account.role === 'admin') {
        userData.staff_id = (account.role === 'staff' || profile.position) ? profile._id : null;
        userData.position = profile.position || 'Manager';
        userData.is_manager = account.is_manager;
        userData.manager_id = account.manager_id;
        userData.access_level = account.access_level;
        userData.is_superuser = account.is_superuser;
      }
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PROFILE FUNCTIONS ====================

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [auth]
 *     summary: get Me
 *     operationId: getMe
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getMe = async (req, res, next) => {
  try {
    const userData = await authService.getProfile(req.user.id);

    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Cập nhật thông tin profile
 * @access  Private
 */
/**
 * @openapi
 * /api/auth/update-profile:
 *   put:
 *     tags: [auth]
 *     summary: update Profile
 *     operationId: updateProfile
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
exports.updateProfile = async (req, res, next) => {
  try {
    const userData = await authService.updateProfile(req.user.id, req.body);
    logger.info(`User profile updated successfully: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
/**
 * @openapi
 * /api/auth/change-password:
 *   put:
 *     tags: [auth]
 *     summary: change Password
 *     operationId: changePassword
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
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    await authService.changePassword(req.user.id, current_password, new_password);
    logger.info(`User password changed successfully: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TOKEN VERIFICATION ====================

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Public
 */
/**
 * @openapi
 * /api/auth/verify-token:
 *   post:
 *     tags: [auth]
 *     summary: verify Token
 *     operationId: verifyToken
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
exports.verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = authService.verifyToken(token);

    res.json({
      success: true,
      message: 'Token hợp lệ',
      data: {
        user: decoded
      }
    });
  } catch (error) {
    next(error);
  }
};

