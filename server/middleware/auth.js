// middleware/auth.js - Authentication Middleware
const jwt = require('jsonwebtoken');
const { Account, Staff, Customer, Manager } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * Middleware để xác thực token
 * Kiểm tra JWT token trong header và gắn user vào req.user
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token, vui lòng đăng nhập'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Bỏ "Bearer " prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Handle demo admin
    if (decoded.id === 'demo-admin-id') {
      req.user = {
        id: 'demo-admin-id',
        role: 'admin',
        email: 'admin@supermarket.com',
        is_demo: true
      };
      return next();
    }

    // Tìm account từ database
    const account = await Account.findOne({
      _id: decoded.id,
      isDelete: false,
      is_active: true
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Gắn user vào request với thông tin cơ bản
    req.user = {
      id: account._id,
      username: account.username,
      email: account.email,
      role: account.role,
      full_name: account.full_name
    };

    // Nếu là staff, lấy thêm staffId và position
    if (account.role === 'staff') {
      const staff = await Staff.findOne({
        account_id: account._id,
        isDelete: false
      });

      if (staff) {
        req.user.staffId = staff._id;
        req.user.position = staff.position;
      }
    }

    // Nếu là admin, kiểm tra có phải manager không
    if (account.role === 'admin') {
      const manager = await Manager.findOne({
        account_id: account._id,
        isDelete: false
      });

      if (manager) {
        req.user.managerId = manager._id;
        req.user.is_manager = true;
        req.user.access_level = manager.access_level;
      }
    }

    // Nếu là customer, lấy customerId
    if (account.role === 'customer') {
      const customer = await Customer.findOne({
        account_id: account._id,
        isDelete: false
      });

      if (customer) {
        req.user.customerId = customer._id;
        req.user.membership_type = customer.membership_type;
      }
    }

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra role admin
 * Chỉ cho phép admin truy cập
 */
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Chỉ admin mới có quyền truy cập'
  });
};

/**
 * Middleware kiểm tra role staff
 * Cho phép staff và admin truy cập
 */
exports.requireStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Chỉ nhân viên và admin mới có quyền truy cập'
  });
};

/**
 * Middleware kiểm tra role customer
 * Chỉ cho phép customer truy cập
 */
exports.requireCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Chỉ khách hàng mới có quyền truy cập'
  });
};

/**
 * Middleware kiểm tra nhiều roles
 * Cho phép các roles được chỉ định truy cập
 * @param {Array} roles - Mảng các roles được phép (ví dụ: ['admin', 'staff'])
 */
exports.requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập chức năng này'
    });
  };
};

/**
 * Optional authentication middleware
 * Không bắt buộc đăng nhập nhưng sẽ gắn user nếu có token hợp lệ
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Không có token, tiếp tục mà không gắn user
      return next();
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token không hợp lệ, tiếp tục mà không gắn user
      return next();
    }

    // Handle demo admin
    if (decoded.id === 'demo-admin-id') {
      req.user = {
        id: 'demo-admin-id',
        role: 'admin',
        email: 'admin@supermarket.com',
        is_demo: true
      };
      return next();
    }

    const account = await Account.findOne({
      _id: decoded.id,
      isDelete: false,
      is_active: true
    });

    if (account) {
      req.user = {
        id: account._id,
        username: account.username,
        email: account.email,
        role: account.role,
        full_name: account.full_name
      };
    }

    next();
  } catch (error) {
    console.error('Optional Auth Error:', error);
    // Lỗi không ảnh hưởng, tiếp tục mà không gắn user
    next();
  }
};
