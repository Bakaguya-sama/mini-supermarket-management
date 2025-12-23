// controllers/authController.js - Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Account, Staff, Customer, Manager } = require('../models');

// JWT Secret (nên để trong .env trong production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ==================== HELPER FUNCTIONS ====================

/**
 * Tạo JWT token
 */
const generateToken = (userId, role, email) => {
  return jwt.sign(
    { 
      id: userId, 
      role: role,
      email: email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * So sánh password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// ==================== REGISTER FUNCTIONS ====================

/**
 * @route   POST /api/auth/register/customer
 * @desc    Đăng ký tài khoản khách hàng mới
 * @access  Public
 */
exports.registerCustomer = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      full_name,
      phone,
      address,
      date_of_birth,
      membership_type
    } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password và email là bắt buộc'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Check if username already exists
    const existingUsername = await Account.findOne({ 
      username: username.toLowerCase(),
      isDelete: false 
    });
    
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // Check if email already exists
    const existingEmail = await Account.findOne({ 
      email: email.toLowerCase(),
      isDelete: false 
    });
    
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create Account
    const account = await Account.create({
      username: username.toLowerCase(),
      password_hash,
      email: email.toLowerCase(),
      full_name: full_name || '',
      phone: phone || '',
      address: address || '',
      date_of_birth: date_of_birth || '',
      avatar_link: '',
      is_active: true,
      role: 'customer'
    });

    // Create Customer profile
    const customer = await Customer.create({
      account_id: account._id,
      membership_type: membership_type || 'basic',
      notes: '',
      points_balance: 0,
      total_spent: 0,
      registered_at: new Date()
    });

    // Generate token
    const token = generateToken(account._id, account.role, account.email);

    // Return success response
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
    console.error('Register Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tài khoản',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/register/staff
 * @desc    Đăng ký tài khoản nhân viên mới (chỉ admin/manager)
 * @access  Private (Admin/Manager only)
 */
exports.registerStaff = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      full_name,
      phone,
      address,
      date_of_birth,
      position,
      employment_type,
      annual_salary,
      hire_date,
      notes
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !position) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, email và position là bắt buộc'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Check if username already exists
    const existingUsername = await Account.findOne({ 
      username: username.toLowerCase(),
      isDelete: false 
    });
    
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // Check if email already exists
    const existingEmail = await Account.findOne({ 
      email: email.toLowerCase(),
      isDelete: false 
    });
    
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create Account
    const account = await Account.create({
      username: username.toLowerCase(),
      password_hash,
      email: email.toLowerCase(),
      full_name: full_name || '',
      phone: phone || '',
      address: address || '',
      date_of_birth: date_of_birth || '',
      avatar_link: '',
      is_active: true,
      role: 'staff'
    });

    // Create Staff profile
    const staff = await Staff.create({
      account_id: account._id,
      position,
      employment_type: employment_type || 'full-time',
      annual_salary: annual_salary || 0,
      hire_date: hire_date || new Date(),
      notes: notes || '',
      is_active: true
    });

    // Return success response (không tự động generate token cho staff khi tạo)
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
    console.error('Register Staff Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký tài khoản',
      error: error.message
    });
  }
};

// ==================== LOGIN FUNCTIONS ====================

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập cho tất cả loại user (customer, staff, admin)
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và password là bắt buộc'
      });
    }

    // DEMO MANAGER ACCOUNT (hardcoded) - Ưu tiên cao nhất cho manager
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      const token = generateToken('demo-admin-id', 'admin', 'admin@supermarket.com');
      
      return res.json({
        success: true,
        message: 'Đăng nhập thành công (Manager Account)',
        data: {
          token,
          user: {
            id: 'demo-admin-id',
            username: 'admin',
            email: 'admin@supermarket.com',
            full_name: 'Demo Manager',
            role: 'admin',
            is_demo: true
          }
        }
      });
    }

    // Find account from database (cho staff và customer)
    const account = await Account.findOne({ 
      username: username.toLowerCase(),
      isDelete: false,
      is_active: true
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Check if account has password (some customers might not have)
    if (!account.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản chưa được kích hoạt chức năng đăng nhập'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, account.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Get additional user info based on role
    let userData = {
      id: account._id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      address: account.address,
      avatar_link: account.avatar_link,
      role: account.role
    };

    if (account.role === 'customer') {
      const customer = await Customer.findOne({ 
        account_id: account._id,
        isDelete: false 
      });
      
      if (customer) {
        userData.customer_id = customer._id;
        userData.membership_type = customer.membership_type;
        userData.points_balance = customer.points_balance;
        userData.total_spent = customer.total_spent;
      }
    } else if (account.role === 'staff') {
      const staff = await Staff.findOne({ 
        account_id: account._id,
        isDelete: false 
      });
      
      if (staff) {
        userData.staff_id = staff._id;
        userData.position = staff.position;
        userData.employment_type = staff.employment_type;
        userData.is_manager = false; // Staff không phải manager
      }
    } else if (account.role === 'admin') {
      // Admin role - check if they are in Manager table
      const manager = await Manager.findOne({ 
        account_id: account._id,
        isDelete: false 
      });
      
      if (manager) {
        userData.is_manager = true;
        userData.manager_id = manager._id;
        userData.access_level = manager.access_level;
        userData.is_superuser = manager.is_superuser;
        userData.permissions = manager.permissions;
        userData.scope = manager.scope;
      }
    }

    // Generate token
    const token = generateToken(account._id, account.role, account.email);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: userData
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// ==================== PROFILE FUNCTIONS ====================

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user được set bởi auth middleware
    const userId = req.user.id;

    // Handle demo admin account
    if (userId === 'demo-admin-id') {
      return res.json({
        success: true,
        data: {
          user: {
            id: 'demo-admin-id',
            username: 'admin',
            email: 'admin@supermarket.com',
            full_name: 'Demo Manager',
            role: 'admin',
            is_demo: true
          }
        }
      });
    }

    const account = await Account.findOne({ 
      _id: userId,
      isDelete: false,
      is_active: true
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    let userData = {
      id: account._id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      address: account.address,
      date_of_birth: account.date_of_birth,
      avatar_link: account.avatar_link,
      role: account.role
    };

    if (account.role === 'customer') {
      const customer = await Customer.findOne({ 
        account_id: account._id,
        isDelete: false 
      });
      
      if (customer) {
        userData.customer_id = customer._id;
        userData.membership_type = customer.membership_type;
        userData.points_balance = customer.points_balance;
        userData.total_spent = customer.total_spent;
      }
    } else if (account.role === 'staff') {
      const staff = await Staff.findOne({ 
        account_id: account._id,
        isDelete: false 
      });
      
      if (staff) {
        userData.staff_id = staff._id;
        userData.position = staff.position;
        userData.employment_type = staff.employment_type;
        userData.annual_salary = staff.annual_salary;
        userData.hire_date = staff.hire_date;

        const manager = await Manager.findOne({ 
          account_id: account._id,
          isDelete: false 
        });
        
        if (manager) {
          userData.is_manager = true;
          userData.manager_id = manager._id;
          userData.access_level = manager.access_level;
          userData.is_superuser = manager.is_superuser;
        }
      }
    }

    res.json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Cập nhật thông tin profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Demo admin không được update
    if (userId === 'demo-admin-id') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật tài khoản demo'
      });
    }

    const {
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link
    } = req.body;

    const account = await Account.findOne({ 
      _id: userId,
      isDelete: false 
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Update fields if provided
    if (full_name !== undefined) account.full_name = full_name;
    if (phone !== undefined) account.phone = phone;
    if (address !== undefined) account.address = address;
    if (date_of_birth !== undefined) account.date_of_birth = date_of_birth;
    if (avatar_link !== undefined) account.avatar_link = avatar_link;

    await account.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user: {
          id: account._id,
          username: account.username,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          address: account.address,
          date_of_birth: account.date_of_birth,
          avatar_link: account.avatar_link,
          role: account.role
        }
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Demo admin không được đổi password
    if (userId === 'demo-admin-id') {
      return res.status(400).json({
        success: false,
        message: 'Không thể đổi mật khẩu tài khoản demo'
      });
    }

    // Validate
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const account = await Account.findOne({ 
      _id: userId,
      isDelete: false 
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(current_password, account.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash and update new password
    account.password_hash = await hashPassword(new_password);
    await account.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu',
      error: error.message
    });
  }
};

// ==================== TOKEN VERIFICATION ====================

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Public
 */
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token là bắt buộc'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      message: 'Token hợp lệ',
      data: {
        user: {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      error: error.message
    });
  }
};
