// server/middleware/validation.middleware.js

// ==================== VALIDATE STAFF ====================
exports.validateStaff = (req, res, next) => {
  const { 
    username, 
    password, 
    email, 
    fullName, 
    position,
    employmentType
  } = req.body;

  const errors = [];

  // Kiểm tra username
  if (!username || username.trim() === '') {
    errors.push('Username là bắt buộc');
  } else if (username.length < 3) {
    errors.push('Username phải có ít nhất 3 ký tự');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username chỉ chứa chữ, số, dấu gạch dưới và dấu gạch ngang');
  }

  // Kiểm tra password
  if (!password || password.trim() === '') {
    errors.push('Mật khẩu là bắt buộc');
  } else if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Kiểm tra email
  if (!email || email.trim() === '') {
    errors.push('Email là bắt buộc');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email không hợp lệ');
  }

  // Kiểm tra fullName
  if (!fullName || fullName.trim() === '') {
    errors.push('Họ và tên là bắt buộc');
  } else if (fullName.length < 2) {
    errors.push('Họ và tên phải có ít nhất 2 ký tự');
  }

  // Kiểm tra position
  const validPositions = ['cashier', 'warehouse', 'delivery', 'manager'];
  if (!position || !validPositions.includes(position)) {
    errors.push(`Chức vụ phải là một trong: ${validPositions.join(', ')}`);
  }

  // Kiểm tra employmentType (optional)
  if (employmentType) {
    const validTypes = ['fulltime', 'parttime', 'contract'];
    if (!validTypes.includes(employmentType)) {
      errors.push(`Loại lao động phải là một trong: ${validTypes.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  next();
};

// ==================== VALIDATE PASSWORD ====================
exports.validatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = [];

  if (!oldPassword || oldPassword.trim() === '') {
    errors.push('Mật khẩu cũ là bắt buộc');
  }

  if (!newPassword || newPassword.trim() === '') {
    errors.push('Mật khẩu mới là bắt buộc');
  } else if (newPassword.length < 6) {
    errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
  } else if (oldPassword === newPassword) {
    errors.push('Mật khẩu mới phải khác với mật khẩu cũ');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  next();
};

// ==================== VALIDATE UPDATE STAFF ====================
exports.validateUpdateStaff = (req, res, next) => {
  const { 
    email,
    position,
    employmentType,
    phone
  } = req.body;

  const errors = [];

  // Kiểm tra email nếu được gửi
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email không hợp lệ');
  }

  // Kiểm tra position nếu được gửi
  if (position) {
    const validPositions = ['cashier', 'warehouse', 'delivery', 'manager'];
    if (!validPositions.includes(position)) {
      errors.push(`Chức vụ phải là một trong: ${validPositions.join(', ')}`);
    }
  }

  // Kiểm tra employmentType nếu được gửi
  if (employmentType) {
    const validTypes = ['fulltime', 'parttime', 'contract'];
    if (!validTypes.includes(employmentType)) {
      errors.push(`Loại lao động phải là một trong: ${validTypes.join(', ')}`);
    }
  }

  // Kiểm tra phone format
  if (phone && !/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''))) {
    errors.push('Số điện thoại không hợp lệ');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  next();
};

// ==================== VALIDATE PAGINATION ====================
exports.validatePagination = (req, res, next) => {
  const { limit = 50, page = 1 } = req.query;

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit phải là số từ 1 đến 100'
    });
  }

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page phải là số lớn hơn 0'
    });
  }

  next();
};
