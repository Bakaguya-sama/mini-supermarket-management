// controllers/orderController.js - VIẾT LẠI HOÀN TOÀN
const { Order, OrderItem, Cart, CartItem, Product, Customer } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Create order from cart (checkout)
 * @route   POST /api/orders/checkout
 * @access  Public
 */
exports.createOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer_id, delivery_address, payment_method, notes } = req.body;

    // Validate input
    if (!customer_id) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!delivery_address) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    // Find customer
    const customer = await Customer.findById(customer_id).session(session);
    if (!customer) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Find active cart
    const cart = await Cart.findOne({
      customer_id: customer_id,
      status: 'active',
      isDelete: false
    }).session(session);

    if (!cart) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Get cart items
    const cartItems = await CartItem.find({
      cart_id: cart._id,
      status: 'active',
      isDelete: false
    }).populate('product_id').session(session);

    if (cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (!item.product_id) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Product ${item.product_name} not found`
        });
      }

      if (item.product_id.current_stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product_name}. Available: ${item.product_id.current_stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Generate order number
    const orderCount = await Order.countDocuments().session(session);
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Create order
    const order = await Order.create([{
      order_number: orderNumber,
      customer_id: customer_id,
      order_date: new Date(),
      status: 'pending',
      delivery_address: delivery_address,
      payment_method: payment_method || 'Cash',
      total_amount: cart.total,
      notes: notes
    }], { session });

    // Create order items and deduct stock
    const orderItems = [];
    for (const cartItem of cartItems) {
      // Create order item
      const orderItem = await OrderItem.create([{
        order_id: order[0]._id,
        product_id: cartItem.product_id._id,
        quantity: cartItem.quantity,
        unit_price: cartItem.unit_price,
        status: 'pending'
      }], { session });

      orderItems.push(orderItem[0]);

      // Deduct stock
      await Product.findByIdAndUpdate(
        cartItem.product_id._id,
        { $inc: { current_stock: -cartItem.quantity } },
        { session }
      );
    }

    // Mark cart as checked out
    cart.status = 'checked_out';
    await cart.save({ session });

    // Mark cart items as purchased
    await CartItem.updateMany(
      { cart_id: cart._id },
      { $set: { status: 'purchased' } },
      { session }
    );

    // Update customer total spent
    await Customer.findByIdAndUpdate(
      customer_id,
      { $inc: { total_spent: cart.total } },
      { session }
    );

    await session.commitTransaction();

    // Populate order items with product details
    await Order.populate(order[0], {
      path: 'customer_id',
      select: 'account_id membership_type points_balance'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: order[0],
        orderItems: orderItems,
        itemCount: orderItems.length
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in createOrderFromCart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all orders (with filters and pagination)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer_id, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = { isDelete: false };
    if (status) filter.status = status;
    if (customer_id && mongoose.Types.ObjectId.isValid(customer_id)) {
      filter.customer_id = customer_id;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders
    const orders = await Order.find(filter)
      .populate('customer_id', 'account_id membership_type')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Public
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: id,
      isDelete: false
    }).populate('customer_id', 'account_id membership_type points_balance');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({
      order_id: order._id,
      isDelete: false
    }).populate('product_id', 'name unit price image_link');

    res.status(200).json({
      success: true,
      data: {
        order,
        items: orderItems,
        itemCount: orderItems.length
      }
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, notes } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: id,
      isDelete: false
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update fields
    if (status) order.status = status;
    if (tracking_number) order.tracking_number = tracking_number;
    if (notes) order.notes = notes;

    // Set delivery date if delivered
    if (status === 'delivered' && !order.delivery_date) {
      order.delivery_date = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel order (restore stock)
 * @route   DELETE /api/orders/:id
 * @access  Public
 */
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: id,
      isDelete: false
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({
      order_id: order._id,
      isDelete: false
    }).session(session);

    // Restore stock for each item
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { current_stock: item.quantity } },
        { session }
      );
    }

    // Update order status
    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock restored.',
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in cancelOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get orders by customer
 * @route   GET /api/orders/customer/:customerId
 * @access  Public
 */
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate customerId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Build filter
    const filter = {
      customer_id: customerId,
      isDelete: false
    };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getOrdersByCustomer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
exports.getOrderStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Order.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { isDelete: false, status: { $in: ['delivered', 'confirmed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } }
    ]);

    // Get order count by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyOrders = await Order.aggregate([
      { $match: { isDelete: false, order_date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$order_date' } },
          count: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusCounts,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
        last7Days: dailyOrders
      }
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
      error: error.message
    });
  }
};
