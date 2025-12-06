// server/controllers/staff.controller.js
const models = require('../models');
const bcrypt = require('bcrypt');

// ==================== GET ALL STAFF ====================
exports.getAllStaff = async (req, res) => {
  try {
    const { position, status, search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (position) query.position = position;
    if (status) query.isActive = status === 'active';
    if (search) {
      // Tìm kiếm trong tên nhân viên hoặc email
      const accounts = await models.Account.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.accountId = { $in: accounts.map(a => a._id) };
    }

    const skip = (page - 1) * limit;
    const staffList = await models.Staff.find(query)
      .populate('accountId', 'username fullName email phone avatarLink isActive')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await models.Staff.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhân viên thành công',
      data: staffList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách nhân viên',
      error: error.message
    });
  }
};

// ==================== GET STAFF BY ID ====================
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await models.Staff.findById(id)
      .populate('accountId', 'username fullName email phone dateOfBirth address avatarLink isActive')
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Nhân viên không tồn tại'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin nhân viên thành công',
      data: staff
    });
  } catch (error) {
    console.error('Error in getStaffById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin nhân viên',
      error: error.message
    });
  }
};

// ==================== CREATE STAFF ====================
exports.createStaff = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      email, 
      fullName, 
      phone, 
      dateOfBirth,
      address,
      position, 
      employmentType, 
      annualSalary,
      hireDate,
      notes
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !fullName || !position) {
      return res.status(400).json({
        success: false,
        message: 'Các trường bắt buộc: username, password, email, fullName, position'
      });
    }

    // Kiểm tra username/email đã tồn tại
    const existingAccount = await models.Account.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: 'Username hoặc email đã tồn tại'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo account
    const newAccount = await models.Account.create({
      username,
      passwordHash,
      email,
      fullName,
      phone,
      dateOfBirth,
      address,
      role: 'staff',
      isActive: true
    });

    // Tạo staff record
    const newStaff = await models.Staff.create({
      accountId: newAccount._id,
      position,
      employmentType,
      annualSalary,
      hireDate: hireDate || new Date(),
      notes,
      isActive: true
    });

    // Populate account data
    await newStaff.populate('accountId', 'username fullName email phone isActive');

    return res.status(201).json({
      success: true,
      message: 'Tạo nhân viên thành công',
      data: newStaff
    });
  } catch (error) {
    console.error('Error in createStaff:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo nhân viên',
      error: error.message
    });
  }
};

// ==================== UPDATE STAFF ====================
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fullName, 
      email,
      phone, 
      dateOfBirth,
      address,
      position, 
      employmentType, 
      annualSalary,
      notes,
      isActive
    } = req.body;

    const staff = await models.Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Nhân viên không tồn tại'
      });
    }

    // Cập nhật account info
    const updateAccountData = {};
    if (fullName) updateAccountData.fullName = fullName;
    if (email) updateAccountData.email = email;
    if (phone) updateAccountData.phone = phone;
    if (dateOfBirth) updateAccountData.dateOfBirth = dateOfBirth;
    if (address) updateAccountData.address = address;
    if (isActive !== undefined) updateAccountData.isActive = isActive;

    if (Object.keys(updateAccountData).length > 0) {
      // Kiểm tra email trùng
      if (updateAccountData.email) {
        const existingEmail = await models.Account.findOne({
          email: updateAccountData.email,
          _id: { $ne: staff.accountId }
        });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email đã tồn tại'
          });
        }
      }

      await models.Account.findByIdAndUpdate(staff.accountId, updateAccountData);
    }

    // Cập nhật staff info
    const updateStaffData = {};
    if (position) updateStaffData.position = position;
    if (employmentType) updateStaffData.employmentType = employmentType;
    if (annualSalary) updateStaffData.annualSalary = annualSalary;
    if (notes) updateStaffData.notes = notes;

    const updatedStaff = await models.Staff.findByIdAndUpdate(
      id,
      updateStaffData,
      { new: true }
    ).populate('accountId', 'username fullName email phone dateOfBirth address isActive');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật nhân viên thành công',
      data: updatedStaff
    });
  } catch (error) {
    console.error('Error in updateStaff:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật nhân viên',
      error: error.message
    });
  }
};

// ==================== DELETE STAFF ====================
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.body; // true = xóa cứng, false = soft delete

    const staff = await models.Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Nhân viên không tồn tại'
      });
    }

    if (hardDelete) {
      // Xóa cứng cả Account và Staff
      await models.Account.findByIdAndDelete(staff.accountId);
      await models.Staff.findByIdAndDelete(id);
    } else {
      // Soft delete - chỉ đánh dấu isActive = false
      await models.Account.findByIdAndUpdate(staff.accountId, { isActive: false });
      await models.Staff.findByIdAndUpdate(id, { isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa nhân viên thành công'
    });
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa nhân viên',
      error: error.message
    });
  }
};

// ==================== CHANGE PASSWORD ====================
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mật khẩu cũ và mới'
      });
    }

    const staff = await models.Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Nhân viên không tồn tại'
      });
    }

    const account = await models.Account.findById(staff.accountId);
    
    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, account.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không chính xác'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await models.Account.findByIdAndUpdate(
      staff.accountId,
      { passwordHash: newPasswordHash }
    );

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi đổi mật khẩu',
      error: error.message
    });
  }
};

// ==================== GET STAFF BY POSITION ====================
exports.getStaffByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const validPositions = ['cashier', 'warehouse', 'delivery', 'manager'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: `Chức vụ không hợp lệ. Chấp nhận: ${validPositions.join(', ')}`
      });
    }

    const skip = (page - 1) * limit;
    const staffList = await models.Staff.find({ position, isActive: true })
      .populate('accountId', 'username fullName email phone isActive')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await models.Staff.countDocuments({ position, isActive: true });

    return res.status(200).json({
      success: true,
      message: `Lấy danh sách ${position} thành công`,
      data: staffList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getStaffByPosition:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách nhân viên theo chức vụ',
      error: error.message
    });
  }
};

// ==================== GET STAFF STATISTICS ====================
exports.getStaffStatistics = async (req, res) => {
  try {
    const totalStaff = await models.Staff.countDocuments({ isActive: true });
    const cashiers = await models.Staff.countDocuments({ position: 'cashier', isActive: true });
    const warehouse = await models.Staff.countDocuments({ position: 'warehouse', isActive: true });
    const delivery = await models.Staff.countDocuments({ position: 'delivery', isActive: true });
    const managers = await models.Staff.countDocuments({ position: 'manager', isActive: true });

    const statistics = {
      total: totalStaff,
      byPosition: {
        cashier: cashiers,
        warehouse,
        delivery,
        manager: managers
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê nhân viên thành công',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getStaffStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê nhân viên',
      error: error.message
    });
  }
};
