// server/controllers/orderController.js
const orderService = require('../services/OrderService');
const { traceCheckout } = require('../middleware/tracing');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filters and pagination
 * @access  Public
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { orders, total, page, pages } = await orderService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Public
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/orders/customer/:customerId
 * @desc    Get orders by customer
 * @access  Public
 */
exports.getOrdersByCustomer = async (req, res, next) => {
  try {
    const { orders, total, page, pages } = await orderService.getOrdersByCustomer(req.params.customerId, req.query);
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/orders/stats/summary
 * @desc    Get order statistics
 * @access  Public
 */
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await orderService.getOrderStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Public
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { customer_id, cart_id } = req.body;

    // Wrap with Business Tracing
    const result = await traceCheckout(customer_id, cart_id, async ({ setOrderAttributes }) => {
      const orderResult = await orderService.createOrder(req.body);
      
      // Update trace attributes
      setOrderAttributes({
        itemCount: orderResult.itemCount,
        totalAmount: orderResult.totalAmount,
        promoDiscount: orderResult.promoDiscount,
        pointsRedeemed: orderResult.pointsRedeemed
      });

      // Clear cart cache in Redis to show empty cart in frontend
      try {
        if (cart_id) await redisClient.del(`cart:session:${cart_id}`);
        if (customer_id) await redisClient.del(`cart:session:customer:${customer_id}`);
      } catch (err) {
        logger.warn(`Failed to clear cart cache after checkout: ${err.message}`);
      }

      return orderResult;
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { 
        order: result.order, 
        invoice: result.invoice,
        pointsEarned: result.pointsEarned
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order
 * @access  Public
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/orders/:id/items/:itemId/status
 * @desc    Update order item status
 * @access  Public
 */
exports.updateOrderItemStatus = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const { status } = req.body;
    const orderItem = await orderService.updateOrderItemStatus(id, itemId, status);
    res.status(200).json({
      success: true,
      message: 'Order item status updated successfully',
      data: orderItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Public
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order (soft delete)
 * @access  Public
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await orderService.deleteOrder(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
