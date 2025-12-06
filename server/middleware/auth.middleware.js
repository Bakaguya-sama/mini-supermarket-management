// server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const models = require('../models');

// ==================== AUTHENTICATE TOKEN ====================
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu token để xác thực'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      // Lấy thông tin user từ database
      const account = await models.Account.findById(decoded.accountId).lean();
      if (!account || !account.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User không tồn tại hoặc đã bị khóa'
        });
      }

      req.user = { ...decoded, accountId: decoded.accountId };
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

// ==================== AUTHORIZE ROLE ====================
exports.authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền truy cập. Yêu cầu role: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error in authorizeRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực quyền',
        error: error.message
      });
    }
  };
};

// ==================== AUTHORIZE STAFF OWNER (Optional) ====================
// Cho phép staff truy cập thông tin của chính họ hoặc admin
exports.authorizeStaffOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Admin có thể truy cập tất cả
    if (user.role === 'admin') {
      return next();
    }

    // Staff chỉ có thể truy cập thông tin của chính họ
    const staff = await models.Staff.findById(id).lean();
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Nhân viên không tồn tại'
      });
    }

    if (staff.accountId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể truy cập thông tin của chính mình'
      });
    }

    next();
  } catch (error) {
    console.error('Error in authorizeStaffOwner:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực quyền',
      error: error.message
    });
  }
};
