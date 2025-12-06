// server/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');

// ==================== AUTHENTICATE - Login ====================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('[auth.controller] 🔐 Login attempt:', username);

    // Validate input
    if (!username || !password) {
      console.log('[auth.controller] ❌ Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username và password là bắt buộc'
      });
    }

    // Find account by username
    const account = await models.Account.findOne({ username }).select('+passwordHash');

    if (!account) {
      console.log('[auth.controller] ❌ Account not found:', username);
      return res.status(401).json({
        success: false,
        message: 'Username hoặc password không chính xác'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, account.passwordHash);

    if (!isPasswordValid) {
      console.log('[auth.controller] ❌ Password invalid for:', username);
      return res.status(401).json({
        success: false,
        message: 'Username hoặc password không chính xác'
      });
    }

    // Check if account is active
    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản này đã bị khóa'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        accountId: account._id, 
        username: account.username,
        role: account.role,
        email: account.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Get user details based on role
    let userData = {
      _id: account._id,
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      phone: account.phone,
      role: account.role,
      isActive: account.isActive
    };

    // If staff, get staff info
    if (account.role === 'staff' || account.role === 'manager') {
      const staff = await models.Staff.findOne({ accountId: account._id });
      if (staff) {
        userData.staffId = staff._id;
        userData.position = staff.position;
        userData.employmentType = staff.employmentType;
      }
    }

    // If customer, get customer info
    if (account.role === 'customer') {
      const customer = await models.Customer.findOne({ accountId: account._id });
      if (customer) {
        userData.customerId = customer._id;
        userData.membershipType = customer.membershipType;
        userData.pointsBalance = customer.pointsBalance;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ==================== REGISTER - Create account ====================
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role = 'customer' } = req.body;

    // Validate input
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, và fullName là bắt buộc'
      });
    }

    // Check if username already exists
    const existingUsername = await models.Account.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username này đã được sử dụng'
      });
    }

    // Check if email already exists
    const existingEmail = await models.Account.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được đăng ký'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account
    const newAccount = await models.Account.create({
      username,
      email,
      passwordHash: hashedPassword,
      fullName,
      phone,
      role
    });

    // If customer role, create customer record
    if (role === 'customer') {
      await models.Customer.create({
        accountId: newAccount._id,
        membershipType: 'regular'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        accountId: newAccount._id, 
        username: newAccount.username,
        role: newAccount.role,
        email: newAccount.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const userData = {
      _id: newAccount._id,
      username: newAccount.username,
      email: newAccount.email,
      fullName: newAccount.fullName,
      phone: newAccount.phone,
      role: newAccount.role
    };

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ==================== LOGOUT ====================
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ==================== GET CURRENT USER ====================
exports.getCurrentUser = async (req, res) => {
  try {
    const accountId = req.user.accountId;

    const account = await models.Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tìm thấy'
      });
    }

    let userData = {
      _id: account._id,
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      phone: account.phone,
      role: account.role,
      isActive: account.isActive
    };

    // If staff, get staff info
    if (account.role === 'staff' || account.role === 'manager') {
      const staff = await models.Staff.findOne({ accountId: account._id });
      if (staff) {
        userData.staffId = staff._id;
        userData.position = staff.position;
        userData.employmentType = staff.employmentType;
      }
    }

    // If customer, get customer info
    if (account.role === 'customer') {
      const customer = await models.Customer.findOne({ accountId: account._id });
      if (customer) {
        userData.customerId = customer._id;
        userData.membershipType = customer.membershipType;
        userData.pointsBalance = customer.pointsBalance;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: userData
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
