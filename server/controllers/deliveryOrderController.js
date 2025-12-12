// controllers/deliveryOrderController.js - VIẾT LẠI HOÀN TOÀN
const { DeliveryOrder, Order, Staff } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Get all delivery orders (with filters and pagination)
 * @route   GET /api/delivery-orders
 * @access  Private/Admin
 */
exports.getAllDeliveryOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, staff_id, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = { isDelete: false };
    if (status) filter.status = status;
    if (staff_id && mongoose.Types.ObjectId.isValid(staff_id)) {
      filter.staff_id = staff_id;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get delivery orders
    const deliveryOrders = await DeliveryOrder.find(filter)
      .populate('order_id', 'order_number customer_id total_amount delivery_address')
      .populate('staff_id', 'account_id position')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await DeliveryOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: deliveryOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllDeliveryOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get delivery order by ID
 * @route   GET /api/delivery-orders/:id
 * @access  Private
 */
exports.getDeliveryOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }

    // Find delivery order
    const deliveryOrder = await DeliveryOrder.findOne({
      _id: id,
      isDelete: false
    })
      .populate({
        path: 'order_id',
        select: 'order_number customer_id total_amount delivery_address notes',
        populate: {
          path: 'customer_id',
          select: 'account_id membership_type'
        }
      })
      .populate('staff_id', 'account_id position phone');

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deliveryOrder
    });
  } catch (error) {
    console.error('Error in getDeliveryOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery order',
      error: error.message
    });
  }
};

/**
 * @desc    Create delivery order
 * @route   POST /api/delivery-orders
 * @access  Private/Admin
 */
exports.createDeliveryOrder = async (req, res) => {
  try {
    const { order_id, staff_id, tracking_number, notes } = req.body;

    // Validate input
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Check if order exists
    const order = await Order.findOne({
      _id: order_id,
      isDelete: false
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order already has delivery order
    const existingDelivery = await DeliveryOrder.findOne({
      order_id: order_id,
      isDelete: false
    });

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Delivery order already exists for this order'
      });
    }

    // Validate staff if provided
    if (staff_id) {
      if (!mongoose.Types.ObjectId.isValid(staff_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff ID'
        });
      }

      const staff = await Staff.findOne({
        _id: staff_id,
        isDelete: false,
        is_active: true
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found or inactive'
        });
      }
    }

    // Create delivery order
    const deliveryOrder = await DeliveryOrder.create({
      order_id: order_id,
      staff_id: staff_id || null,
      order_date: new Date(),
      status: staff_id ? 'assigned' : 'pending',
      tracking_number: tracking_number || `TRK-${Date.now()}`,
      notes: notes
    });

    // Update order status
    if (order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
    }

    // Populate response
    await deliveryOrder.populate([
      { path: 'order_id', select: 'order_number customer_id total_amount' },
      { path: 'staff_id', select: 'account_id position' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Delivery order created successfully',
      data: deliveryOrder
    });
  } catch (error) {
    console.error('Error in createDeliveryOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery order',
      error: error.message
    });
  }
};

/**
 * @desc    Update delivery order status
 * @route   PUT /api/delivery-orders/:id
 * @access  Private
 */
exports.updateDeliveryOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }

    // Validate status
    const validStatuses = ['assigned', 'in_transit', 'delivered', 'failed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find delivery order
    const deliveryOrder = await DeliveryOrder.findOne({
      _id: id,
      isDelete: false
    }).populate('order_id');

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    // Update status
    if (status) {
      deliveryOrder.status = status;

      // Update delivery date if delivered
      if (status === 'delivered' && !deliveryOrder.delivery_date) {
        deliveryOrder.delivery_date = new Date();
        
        // Update order status
        const order = deliveryOrder.order_id;
        if (order) {
          order.status = 'delivered';
          order.delivery_date = new Date();
          await order.save();
        }
      }

      // Mark order as shipped if in_transit
      if (status === 'in_transit') {
        const order = deliveryOrder.order_id;
        if (order && order.status !== 'shipped') {
          order.status = 'shipped';
          await order.save();
        }
      }
    }

    if (notes) {
      deliveryOrder.notes = notes;
    }

    await deliveryOrder.save();

    res.status(200).json({
      success: true,
      message: 'Delivery order updated successfully',
      data: deliveryOrder
    });
  } catch (error) {
    console.error('Error in updateDeliveryOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery order',
      error: error.message
    });
  }
};

/**
 * @desc    Get delivery orders by staff
 * @route   GET /api/delivery-orders/staff/:staffId
 * @access  Private
 */
exports.getDeliveryOrdersByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Validate staffId
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID'
      });
    }

    // Build filter
    const filter = {
      staff_id: staffId,
      isDelete: false
    };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get delivery orders
    const deliveryOrders = await DeliveryOrder.find(filter)
      .populate('order_id', 'order_number customer_id total_amount delivery_address')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await DeliveryOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: deliveryOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getDeliveryOrdersByStaff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get delivery orders by status
 * @route   GET /api/delivery-orders/status/:status
 * @access  Private/Admin
 */
exports.getDeliveryOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate status
    const validStatuses = ['assigned', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get delivery orders
    const deliveryOrders = await DeliveryOrder.find({
      status: status,
      isDelete: false
    })
      .populate('order_id', 'order_number customer_id total_amount')
      .populate('staff_id', 'account_id position')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await DeliveryOrder.countDocuments({ status, isDelete: false });

    res.status(200).json({
      success: true,
      data: deliveryOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getDeliveryOrdersByStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery orders',
      error: error.message
    });
  }
};

/**
 * @desc    Unassign delivery order (remove staff)
 * @route   DELETE /api/delivery-orders/:id/unassign
 * @access  Private/Admin
 */
exports.unassignDeliveryOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery order ID'
      });
    }

    // Find delivery order
    const deliveryOrder = await DeliveryOrder.findOne({
      _id: id,
      isDelete: false
    });

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found'
      });
    }

    // Can only unassign if not yet in transit or delivered
    if (['in_transit', 'delivered'].includes(deliveryOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot unassign delivery with status: ${deliveryOrder.status}`
      });
    }

    // Unassign staff
    deliveryOrder.staff_id = null;
    deliveryOrder.status = 'pending';
    await deliveryOrder.save();

    res.status(200).json({
      success: true,
      message: 'Staff unassigned from delivery order',
      data: deliveryOrder
    });
  } catch (error) {
    console.error('Error in unassignDeliveryOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign delivery order',
      error: error.message
    });
  }
};

/**
 * @desc    Get delivery statistics
 * @route   GET /api/delivery-orders/stats
 * @access  Private/Admin
 */
exports.getDeliveryStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await DeliveryOrder.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get delivery success rate
    const totalDeliveries = await DeliveryOrder.countDocuments({ isDelete: false });
    const successfulDeliveries = await DeliveryOrder.countDocuments({ 
      status: 'delivered', 
      isDelete: false 
    });
    const failedDeliveries = await DeliveryOrder.countDocuments({ 
      status: 'failed', 
      isDelete: false 
    });

    const successRate = totalDeliveries > 0 
      ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(2) 
      : 0;

    // Get top delivery staff
    const topStaff = await DeliveryOrder.aggregate([
      { $match: { isDelete: false, staff_id: { $ne: null } } },
      { $group: { _id: '$staff_id', deliveryCount: { $sum: 1 } } },
      { $sort: { deliveryCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staffInfo'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusCounts,
        total: totalDeliveries,
        successful: successfulDeliveries,
        failed: failedDeliveries,
        successRate: parseFloat(successRate),
        topDeliveryStaff: topStaff
      }
    });
  } catch (error) {
    console.error('Error in getDeliveryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get delivery statistics',
      error: error.message
    });
  }
};
