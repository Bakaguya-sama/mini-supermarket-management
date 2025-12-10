// controllers/staffController.js
const { Staff, Account } = require('../models');
const bcrypt = require('bcrypt');

// @desc    Get all staff with filters and pagination
// @route   GET /api/staff
exports.getAllStaff = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      position,
      is_active,
      employment_type,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (position) query.position = position;
    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (employment_type) query.employment_type = employment_type;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    let staffQuery = Staff.find(query)
      .populate('account_id', '-password_hash')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add search if provided
    if (search) {
      const accounts = await Account.find({
        $or: [
          { full_name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const accountIds = accounts.map(acc => acc._id);
      query.account_id = { $in: accountIds };
      
      staffQuery = Staff.find(query)
        .populate('account_id', '-password_hash')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    const staff = await staffQuery;
    const total = await Staff.countDocuments(query);

    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// @desc    Get staff statistics
// @route   GET /api/staff/stats
exports.getStaffStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ is_active: true });
    const inactiveStaff = await Staff.countDocuments({ is_active: false });
    
    const byPosition = await Staff.aggregate([
      { $group: { _id: '$position', count: { $sum: 1 } } }
    ]);
    
    const byEmploymentType = await Staff.aggregate([
      { $group: { _id: '$employment_type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalStaff,
        active: activeStaff,
        inactive: inactiveStaff,
        byPosition,
        byEmploymentType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff statistics',
      error: error.message
    });
  }
};

// @desc    Get single staff by ID
// @route   GET /api/staff/:id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('account_id', '-password_hash');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// @desc    Create new staff with account
// @route   POST /api/staff
exports.createStaff = async (req, res) => {
  try {
    const {
      // Account fields
      username,
      password,
      email,
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link,
      // Staff fields
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
        message: 'Please provide username, password, email, and position'
      });
    }

    // Check if username or email already exists
    const existingAccount = await Account.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create account first
    const account = await Account.create({
      username,
      password_hash,
      email,
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link,
      role: 'staff',
      is_active: true
    });

    // Create staff
    const staff = await Staff.create({
      account_id: account._id,
      position,
      employment_type,
      annual_salary,
      hire_date: hire_date || new Date(),
      notes,
      is_active: true
    });

    // Populate account info
    await staff.populate('account_id', '-password_hash');

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating staff',
      error: error.message
    });
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    const {
      // Account fields to update
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link,
      // Staff fields to update
      position,
      employment_type,
      annual_salary,
      hire_date,
      notes,
      is_active
    } = req.body;

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Update staff fields
    if (position !== undefined) staff.position = position;
    if (employment_type !== undefined) staff.employment_type = employment_type;
    if (annual_salary !== undefined) staff.annual_salary = annual_salary;
    if (hire_date !== undefined) staff.hire_date = hire_date;
    if (notes !== undefined) staff.notes = notes;
    if (is_active !== undefined) staff.is_active = is_active;

    await staff.save();

    // Update account fields if provided
    if (staff.account_id) {
      const accountUpdate = {};
      if (full_name !== undefined) accountUpdate.full_name = full_name;
      if (phone !== undefined) accountUpdate.phone = phone;
      if (address !== undefined) accountUpdate.address = address;
      if (date_of_birth !== undefined) accountUpdate.date_of_birth = date_of_birth;
      if (avatar_link !== undefined) accountUpdate.avatar_link = avatar_link;
      if (is_active !== undefined) accountUpdate.is_active = is_active;

      if (Object.keys(accountUpdate).length > 0) {
        await Account.findByIdAndUpdate(staff.account_id, accountUpdate);
      }
    }

    // Populate updated staff
    await staff.populate('account_id', '-password_hash');

    res.status(200).json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff',
      error: error.message
    });
  }
};

// @desc    Soft delete staff (set is_active = false)
// @route   DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Soft delete - set is_active to false
    staff.is_active = false;
    await staff.save();

    // Also deactivate associated account
    if (staff.account_id) {
      await Account.findByIdAndUpdate(staff.account_id, { is_active: false });
    }

    res.status(200).json({
      success: true,
      message: 'Staff deactivated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff',
      error: error.message
    });
  }
};

// @desc    Permanently delete staff and account
// @route   DELETE /api/staff/:id/permanent
exports.permanentDeleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    const accountId = staff.account_id;

    // Delete staff
    await Staff.findByIdAndDelete(req.params.id);

    // Delete associated account
    if (accountId) {
      await Account.findByIdAndDelete(accountId);
    }

    res.status(200).json({
      success: true,
      message: 'Staff and associated account permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting staff',
      error: error.message
    });
  }
};

// @desc    Activate staff
// @route   PATCH /api/staff/:id/activate
exports.activateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    staff.is_active = true;
    await staff.save();

    // Also activate associated account
    if (staff.account_id) {
      await Account.findByIdAndUpdate(staff.account_id, { is_active: true });
    }

    await staff.populate('account_id', '-password_hash');

    res.status(200).json({
      success: true,
      message: 'Staff activated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating staff',
      error: error.message
    });
  }
};

// @desc    Get staff by account ID
// @route   GET /api/staff/account/:accountId
exports.getStaffByAccountId = async (req, res) => {
  try {
    const staff = await Staff.findOne({ account_id: req.params.accountId })
      .populate('account_id', '-password_hash');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found for this account'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff by account',
      error: error.message
    });
  }
};