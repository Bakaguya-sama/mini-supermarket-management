// server/controllers/customer.controller.js
const models = require('../models');

// Get all customers with pagination and search
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, membershipType } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { 'accountId.fullName': { $regex: search, $options: 'i' } },
        { 'accountId.email': { $regex: search, $options: 'i' } },
        { 'accountId.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (membershipType) {
      filter.membershipType = membershipType;
    }

    const customers = await models.Customer.find(filter)
      .populate('accountId', 'fullName email phone address')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await models.Customer.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khách hàng thành công',
      data: customers,
      pagination: { total, page: Number(page), limit: Number(limit), pages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message
    });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await models.Customer.findById(req.params.id)
      .populate('accountId', 'fullName email phone address dateOfBirth');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message
    });
  }
};

// Get customer by account ID
exports.getCustomerByAccountId = async (req, res) => {
  try {
    const customer = await models.Customer.findOne({ accountId: req.params.accountId })
      .populate('accountId', 'fullName email phone address');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng với tài khoản này'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { accountId, membershipType = 'regular', notes } = req.body;

    // Validate required fields
    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'accountId là bắt buộc'
      });
    }

    // Check if account exists
    const account = await models.Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại'
      });
    }

    // Check if customer already exists
    const existingCustomer = await models.Customer.findOne({ accountId });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Khách hàng đã tồn tại với tài khoản này'
      });
    }

    const customer = await models.Customer.create({
      accountId,
      membershipType,
      notes,
      pointsBalance: 0,
      totalSpent: 0
    });

    const populatedCustomer = await customer.populate('accountId', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Tạo khách hàng thành công',
      data: populatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khách hàng',
      error: error.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { membershipType, notes } = req.body;

    const customer = await models.Customer.findByIdAndUpdate(
      req.params.id,
      { membershipType, notes },
      { new: true, runValidators: true }
    ).populate('accountId', 'fullName email phone');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khách hàng',
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await models.Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa khách hàng thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khách hàng',
      error: error.message
    });
  }
};

// Update customer points
exports.updatePoints = async (req, res) => {
  try {
    const { points, operation = 'add' } = req.body;

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points phải là số dương'
      });
    }

    let newPoints;
    const customer = await models.Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    if (operation === 'add') {
      newPoints = customer.pointsBalance + points;
    } else if (operation === 'subtract') {
      newPoints = Math.max(0, customer.pointsBalance - points);
    } else if (operation === 'set') {
      newPoints = points;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operation không hợp lệ'
      });
    }

    const updated = await models.Customer.findByIdAndUpdate(
      req.params.id,
      { pointsBalance: newPoints },
      { new: true }
    ).populate('accountId', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Cập nhật điểm thành công',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật điểm',
      error: error.message
    });
  }
};

// Get customers by membership type
exports.getCustomersByMembership = async (req, res) => {
  try {
    const { membershipType } = req.params;
    const validTypes = ['regular', 'silver', 'gold', 'platinum'];

    if (!validTypes.includes(membershipType)) {
      return res.status(400).json({
        success: false,
        message: 'Loại thành viên không hợp lệ'
      });
    }

    const customers = await models.Customer.find({ membershipType })
      .populate('accountId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Lấy danh sách khách hàng ${membershipType} thành công`,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message
    });
  }
};

// Get customer statistics
exports.getCustomerStatistics = async (req, res) => {
  try {
    const total = await models.Customer.countDocuments();
    
    const membershipCounts = await models.Customer.aggregate([
      { $group: { _id: '$membershipType', count: { $sum: 1 } } }
    ]);

    const topSpenders = await models.Customer.find()
      .populate('accountId', 'fullName')
      .sort({ totalSpent: -1 })
      .limit(10);

    const totalPointsIssued = await models.Customer.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$pointsBalance' } } }
    ]);

    const totalSpentAgg = await models.Customer.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$totalSpent' } } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê khách hàng thành công',
      data: {
        total,
        membershipCounts,
        topSpenders,
        totalPointsIssued: totalPointsIssued[0]?.totalPoints || 0,
        totalSpent: totalSpentAgg[0]?.totalAmount || 0,
        averageSpent: total > 0 ? (totalSpentAgg[0]?.totalAmount || 0) / total : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

// Update customer total spent
exports.updateTotalSpent = async (req, res) => {
  try {
    const { amount, operation = 'add' } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount phải là số dương'
      });
    }

    const customer = await models.Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    let newTotal;
    if (operation === 'add') {
      newTotal = customer.totalSpent + amount;
    } else if (operation === 'subtract') {
      newTotal = Math.max(0, customer.totalSpent - amount);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operation không hợp lệ'
      });
    }

    const updated = await models.Customer.findByIdAndUpdate(
      req.params.id,
      { totalSpent: newTotal },
      { new: true }
    ).populate('accountId', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Cập nhật tổng chi tiêu thành công',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tổng chi tiêu',
      error: error.message
    });
  }
};
