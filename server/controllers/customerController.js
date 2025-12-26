// controllers/customerController.js - CUSTOMER API HOÀN CHỈNH
const { Customer, Account, Order, Cart } = require('../models');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all customers with filters
 * @route   GET /api/customers
 * @access  Public
 * Note: Returns both active and soft-deleted customers for frontend to display with strikethrough
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      membership_type,
      minSpent,
      maxSpent,
      sort = '-createdAt'
    } = req.query;

    // Build query - include soft-deleted customers so frontend can show them as strikethrough
    const query = {};
    if (membership_type) query.membership_type = membership_type;
    if (minSpent || maxSpent) {
      query.total_spent = {};
      if (minSpent) query.total_spent.$gte = parseFloat(minSpent);
      if (maxSpent) query.total_spent.$lte = parseFloat(maxSpent);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const customers = await Customer.find(query)
      .populate('account_id', 'username email full_name phone address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

/**
 * @desc    Get single customer by ID
 * @route   GET /api/customers/:id
 * @access  Public
 */
exports.getCustomerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(req.params.id)
      .populate('account_id', 'username email full_name phone address avatar_link')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer statistics
    const orders = await Order.countDocuments({ customer_id: req.params.id });
    const carts = await Cart.countDocuments({ customer_id: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...customer,
        stats: {
          totalOrders: orders,
          activeCarts: carts
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer by account ID
 * @route   GET /api/customers/account/:accountId
 * @access  Public
 */
exports.getCustomerByAccount = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.accountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account ID'
      });
    }

    const customer = await Customer.findOne({ account_id: req.params.accountId })
      .populate('account_id', 'username email full_name phone address');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found for this account'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer by account',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/stats
 * @access  Public
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ isDelete: false });
    const activeCustomers = await Customer.countDocuments({ isDelete: false });

    const customersByMembership = await Customer.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$membership_type', count: { $sum: 1 } } }
    ]);

    const totalSpent = await Customer.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, totalAmount: { $sum: '$total_spent' }, avgAmount: { $avg: '$total_spent' } } }
    ]);

    const topCustomers = await Customer.find({ isDelete: false })
      .populate('account_id', 'full_name email')
      .sort('-total_spent')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        byMembership: customersByMembership,
        totalSpent: totalSpent[0]?.totalAmount || 0,
        avgSpent: totalSpent[0]?.avgAmount || 0,
        topCustomers: topCustomers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Create new customer (with or without account creation)
 * @route   POST /api/customers
 * @access  Public
 * 
 * Can accept either:
 * - { account_id, membership_type, notes }
 * - { username, email, full_name, phone, address, membership_type, notes } (creates account first)
 */
exports.createCustomer = async (req, res) => {
  try {
    let account_id = req.body.account_id;
    const {
      membership_type,
      notes,
      username,
      email,
      full_name,
      phone,
      address
    } = req.body;

    // If no account_id provided, create account first
    if (!account_id) {
      // Validate required fields for account creation
      if (!username || !email || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide account_id OR (username, email, full_name)'
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

      // Generate default password: "Customer@" + first 4 chars of username
      const defaultPassword = `Customer@${username.substring(0, 4)}`;
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(defaultPassword, salt);

      // Create account with password
      const newAccount = await Account.create({
        username,
        password_hash,
        email,
        full_name,
        phone: phone || '',
        address: address || '',
        role: 'customer',
        is_active: true
      });

      account_id = newAccount._id;
    } else {
      // Verify account exists if account_id provided
      const account = await Account.findById(account_id);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }
    }

    // Check if customer already exists for this account
    const existingCustomer = await Customer.findOne({ account_id });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists for this account'
      });
    }

    // Create customer
    const customer = await Customer.create({
      account_id,
      membership_type: membership_type || 'Standard',
      notes: notes || '',
      points_balance: 0,
      total_spent: 0,
      registered_at: new Date()
    });

    await customer.populate('account_id', 'username email full_name phone address');

    // Get the account to check if password was just created
    const accountData = await Account.findById(account_id);
    const defaultPassword = `Customer@${accountData.username.substring(0, 4)}`;

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
      loginInfo: {
        username: accountData.username,
        defaultPassword: defaultPassword,
        message: 'Customer can login with this default password. Please advise them to change it after first login.'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Public
 */
exports.updateCustomer = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const {
      membership_type,
      notes,
      points_balance
    } = req.body;

    if (membership_type) customer.membership_type = membership_type;
    if (notes !== undefined) customer.notes = notes;
    if (points_balance !== undefined) customer.points_balance = points_balance;

    await customer.save();
    await customer.populate('account_id', 'username email full_name phone address');

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

/**
 * @desc    Update customer points balance
 * @route   PATCH /api/customers/:id/points
 * @access  Public
 */
exports.updatePoints = async (req, res) => {
  try {
    const { pointsToAdd } = req.body;

    if (pointsToAdd === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide points to add'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $inc: { points_balance: pointsToAdd } },
      { new: true }
    ).populate('account_id', 'username email full_name');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Points updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating points',
      error: error.message
    });
  }
};

/**
 * @desc    Update customer total spent (after order)
 * @route   PATCH /api/customers/:id/spent
 * @access  Public
 */
exports.updateTotalSpent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $inc: { total_spent: parseFloat(amount) } },
      { new: true }
    ).populate('account_id', 'username email full_name');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Total spent updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating total spent',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer orders
 * @route   GET /api/customers/:id/orders
 * @access  Public
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ customer_id: req.params.id })
      .populate('payment_id')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Order.countDocuments({ customer_id: req.params.id });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message
    });
  }
};

/**
 * @desc    Delete customer (soft delete)
 * @route   DELETE /api/customers/:id
 * @access  Public
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.isDelete = true;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};
