// server/controllers/order.controller.js
const models = require('../models');

// ==================== GET ALL ORDERS ====================
exports.getAllOrders = async (req, res) => {
  try {
    const { status, customerId, search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const orders = await models.Order.find(query)
      .populate('customerId', 'fullName email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ orderDate: -1 });

    const total = await models.Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// ==================== GET ORDER BY ID ====================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await models.Order.findById(id)
      .populate('customerId', 'fullName email phone address')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

// ==================== CREATE ORDER ====================
exports.createOrder = async (req, res) => {
  try {
    const { 
      customerId, 
      items,
      notes
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'customerId và items là bắt buộc'
      });
    }

    // Verify customer exists
    const customer = await models.Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Khách hàng không tồn tại'
      });
    }

    // Generate order number
    const count = await models.Order.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const product = await models.Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.productId} không tồn tại`
        });
      }
      totalAmount += product.price * item.quantity;
    }

    const newOrder = await models.Order.create({
      orderNumber,
      customerId,
      items,
      totalAmount,
      status: 'pending',
      notes,
      orderDate: new Date()
    });

    await newOrder.populate('customerId', 'fullName email phone');

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: newOrder
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng',
      error: error.message
    });
  }
};

// ==================== UPDATE ORDER STATUS ====================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status phải là một trong: ${validStatuses.join(', ')}`
      });
    }

    const order = await models.Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    const updatedOrder = await models.Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('customerId', 'fullName email phone');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// ==================== UPDATE ORDER ====================
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, notes, status } = req.body;

    const order = await models.Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // If items updated, recalculate total
    let totalAmount = order.totalAmount;
    if (items) {
      totalAmount = 0;
      for (const item of items) {
        const product = await models.Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Sản phẩm ${item.productId} không tồn tại`
          });
        }
        totalAmount += product.price * item.quantity;
      }
    }

    const updateData = {};
    if (items) updateData.items = items;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;
    if (items) updateData.totalAmount = totalAmount;

    const updatedOrder = await models.Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('customerId', 'fullName email phone');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error in updateOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật đơn hàng',
      error: error.message
    });
  }
};

// ==================== DELETE ORDER ====================
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await models.Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xóa đơn hàng ở trạng thái chờ xử lý'
      });
    }

    await models.Order.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa đơn hàng',
      error: error.message
    });
  }
};

// ==================== GET ORDERS BY STATUS ====================
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status phải là một trong: ${validStatuses.join(', ')}`
      });
    }

    const skip = (page - 1) * limit;
    const orders = await models.Order.find({ status })
      .populate('customerId', 'fullName email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ orderDate: -1 });

    const total = await models.Order.countDocuments({ status });

    return res.status(200).json({
      success: true,
      message: `Lấy đơn hàng ${status} thành công`,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getOrdersByStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// ==================== GET ORDER STATISTICS ====================
exports.getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await models.Order.countDocuments();
    const pendingOrders = await models.Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await models.Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await models.Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await models.Order.countDocuments({ status: 'delivered' });

    // Calculate total revenue
    const result = await models.Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    const statistics = {
      total: totalOrders,
      byStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders
      },
      totalRevenue
    };

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê đơn hàng thành công',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getOrderStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê đơn hàng',
      error: error.message
    });
  }
};

// ==================== GET CUSTOMER ORDERS ====================
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;
    const orders = await models.Order.find({ customerId })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ orderDate: -1 });

    const total = await models.Order.countDocuments({ customerId });

    return res.status(200).json({
      success: true,
      message: 'Lấy đơn hàng của khách hàng thành công',
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getCustomerOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy đơn hàng',
      error: error.message
    });
  }
};
