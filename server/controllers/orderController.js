// controllers/orderController.js - ORDER API HOÀN CHỈNH
const { Order, OrderItem, Product, Customer, Invoice, DeliveryOrder, Payment, Cart, CartItem } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Get all orders with filters and pagination
 * @route   GET /api/orders
 * @access  Public
 */
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer_id,
      status,
      search,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (customer_id) query.customer_id = customer_id;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { tracking_number: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.order_date = {};
      if (startDate) query.order_date.$gte = new Date(startDate);
      if (endDate) query.order_date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.total_amount = {};
      if (minAmount) query.total_amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.total_amount.$lte = parseFloat(maxAmount);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population - ✅ NOW INCLUDING ORDERITEMS
    const orders = await Order.find(query)
      .populate('customer_id', 'account_id membership_type points_balance total_spent')
      .populate({
        path: 'orderItems',
        populate: { path: 'product_id', select: 'name price category sku unit' }
      })
      .populate('payment_id', 'payment_method status payment_date')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    console.log(`📋 Fetched ${orders.length} orders (total: ${total})`);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get single order by ID with items
 * @route   GET /api/orders/:id
 * @access  Public
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer_id', 'account_id membership_type points_balance total_spent')
      .populate({
        path: 'orderItems',
        populate: { 
          path: 'product_id', 
          select: 'name price category sku unit description image_link' 
        }
      })
      .populate('payment_id', 'payment_method status payment_date reference');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📋 Fetched order ${order.order_number} with ${order.orderItems.length} items`);

    // Get delivery order if exists
    const deliveryOrder = await DeliveryOrder.findOne({ order_id: order._id })
      .populate('staff_id', 'account_id position')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        deliveryOrder
      }
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

/**
 * @desc    Get orders by customer
 * @route   GET /api/orders/customer/:customerId
 * @access  Public
 */
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify customer exists
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const query = { customer_id: req.params.customerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate({
        path: 'orderItems',
        populate: { path: 'product_id', select: 'name price category sku' }
      })
      .populate('customer_id', 'account_id membership_type')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-order_date');

    const total = await Order.countDocuments(query);

    console.log(`📋 Fetched ${orders.length} orders for customer ${req.params.customerId}`);

    res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        membership_type: customer.membership_type,
        total_spent: customer.total_spent
      },
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/stats
 * @access  Public
 */
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue,
        byStatus: ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Create new order from cart
 * @route   POST /api/orders
 * @access  Public
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      cart_id,
      notes
    } = req.body;

    // Validate customer
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer ID'
      });
    }

    const customer = await Customer.findById(customer_id).populate('account_id');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    console.log(`👤 Customer: ${customer.account_id?.full_name || 'Unknown'} (Points: ${customer.points_balance})`);

    // Get cart items
    let cartItems = [];
    let cart = null;
    
    if (cart_id) {
      cart = await Cart.findById(cart_id);
      cartItems = await CartItem.find({ cart_id, status: 'active' })
        .populate('product_id');
    } else {
      // Get active cart for customer if cart_id not provided
      cart = await Cart.findOne({ customer_id, status: 'active' });
      if (cart) {
        cartItems = await CartItem.find({ cart_id: cart._id, status: 'active' })
          .populate('product_id');
      }
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.line_total;
    });

    // Count total orders để tạo tracking number sequential
    const totalOrders = await Order.countDocuments();
    const orderSequence = totalOrders + 1;
    
    // Generate order number và tracking number
    const orderNumber = `ORD-${Date.now()}`;
    const trackingNumber = `TRK-${String(orderSequence).padStart(6, '0')}`; // TRK-000001, TRK-000002, ...

    console.log(`📦 Creating order #${orderSequence} with tracking: ${trackingNumber}`);

    // ✅ Create order WITH empty orderItems array
    const order = await Order.create({
      order_number: orderNumber,
      customer_id,
      orderItems: [],  // ← IMPORTANT: Initialize empty array
      total_amount: totalAmount,
      tracking_number: trackingNumber, // ← AUTO GENERATED
      notes,
      status: 'pending'
    });

    console.log(`📦 Created order ${orderNumber}`);

    // Create order items
    const orderItemsData = cartItems.map(item => ({
      order_id: order._id,
      product_id: item.product_id._id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      status: 'pending'
    }));

    const createdOrderItems = await OrderItem.insertMany(orderItemsData);
    console.log(`📦 Created ${createdOrderItems.length} order items`);

    // ✅ IMPORTANT: Link orderItems back to order
    await Order.findByIdAndUpdate(order._id, {
      orderItems: createdOrderItems.map(oi => oi._id)
    });

    console.log(`✅ Linked ${createdOrderItems.length} items to order`);

    // Update cart status
    if (cart) {
      await Cart.findByIdAndUpdate(cart._id, { 
        status: 'checked_out',
        cartItems: []  // Clear cart items
      });
      await CartItem.updateMany({ cart_id: cart._id }, { status: 'purchased' });
      console.log(`🛒 Cart checked out`);
    }

    // Parse notes to extract promotion and points info
    let pointsRedeemed = 0;
    let promoDiscount = 0;
    let pointsDiscount = 0;
    
    if (notes) {
      // Extract points redeemed: "Points Redeemed: 500 points = -$5.00"
      const pointsMatch = notes.match(/Points Redeemed: (\d+) points = -\$([0-9.]+)/);
      if (pointsMatch) {
        pointsRedeemed = parseInt(pointsMatch[1]);
        pointsDiscount = parseFloat(pointsMatch[2]);
      }
      
      // Extract promo discount: "Discount: 20% = -$6400.00"
      const promoMatch = notes.match(/Discount: .*? = -\$([0-9.]+)/);
      if (promoMatch) {
        promoDiscount = parseFloat(promoMatch[1]);
      }
    }

    // Calculate actual amount paid (after all discounts)
    const actualAmountPaid = totalAmount - promoDiscount - pointsDiscount;
    
    console.log(`💰 Order breakdown:`);
    console.log(`   Subtotal: $${totalAmount.toFixed(2)}`);
    if (promoDiscount > 0) console.log(`   Promo discount: -$${promoDiscount.toFixed(2)}`);
    if (pointsDiscount > 0) console.log(`   Points discount: -$${pointsDiscount.toFixed(2)}`);
    console.log(`   Final paid: $${actualAmountPaid.toFixed(2)}`);

    // Update customer
    const oldPointsBalance = customer.points_balance;
    
    // Step 1: Deduct redeemed points
    if (pointsRedeemed > 0) {
      customer.points_balance = Math.max(0, customer.points_balance - pointsRedeemed);
      console.log(`🎁 Deducted ${pointsRedeemed} points (${oldPointsBalance} → ${customer.points_balance})`);
    }
    
    // Step 2: Award points for purchase (1 point per $1 actually paid)
    const pointsEarned = Math.floor(actualAmountPaid);
    customer.points_balance += pointsEarned;
    console.log(`⭐ Earned ${pointsEarned} points from $${actualAmountPaid.toFixed(2)} purchase`);
    console.log(`💎 Final points balance: ${oldPointsBalance} - ${pointsRedeemed} + ${pointsEarned} = ${customer.points_balance}`);
    
    // Step 3: Update total spent (based on actual amount paid)
    customer.total_spent += actualAmountPaid;
    
    await customer.save();
    console.log(`💰 Updated customer total spent to $${customer.total_spent.toFixed(2)}`);

    // Fetch complete order with items
    const completeOrder = await Order.findById(order._id)
      .populate('customer_id', 'account_id membership_type')
      .populate({
        path: 'orderItems',
        populate: { path: 'product_id', select: 'name price sku unit' }
      });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Public
 */
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const {
      status,
      tracking_number,
      notes,
      delivery_date
    } = req.body;

    if (status) order.status = status;
    if (tracking_number) order.tracking_number = tracking_number;
    if (notes !== undefined) order.notes = notes;
    if (delivery_date) order.delivery_date = new Date(delivery_date);

    await order.save();
    await order.populate('customer_id');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order item status
 * @route   PATCH /api/orders/:id/items/:itemId/status
 * @access  Public
 */
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'picked', 'packed', 'shipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const orderItem = await OrderItem.findByIdAndUpdate(
      req.params.itemId,
      { status },
      { new: true }
    ).populate('product_id');

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order item status updated',
      data: orderItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order item',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel order
 * @route   PATCH /api/orders/:id/cancel
 * @access  Public
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

/**
 * @desc    Delete order (soft delete)
 * @route   DELETE /api/orders/:id
 * @access  Public
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isDelete = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};
