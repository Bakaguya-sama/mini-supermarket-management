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
/**
 * @openapi
 * /api/orders/:
 *   get:
 *     tags: [order]
 *     summary: get All Orders
 *     operationId: getAllOrders
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [order]
 *     summary: get Order By Id
 *     operationId: getOrderById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/customer/{customerId}:
 *   get:
 *     tags: [order]
 *     summary: get Orders By Customer
 *     operationId: getOrdersByCustomer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/stats:
 *   get:
 *     tags: [order]
 *     summary: get Order Stats
 *     operationId: getOrderStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/:
 *   post:
 *     tags: [order]
 *     summary: create Order
 *     operationId: createOrder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
        ...result.order.toObject(), 
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
/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     tags: [order]
 *     summary: update Order
 *     operationId: updateOrder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/{id}/items/{itemId}/status:
 *   patch:
 *     tags: [order]
 *     summary: update Order Item Status
 *     operationId: updateOrderItemStatus
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [order]
 *     summary: cancel Order
 *     operationId: cancelOrder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     tags: [order]
 *     summary: delete Order
 *     operationId: deleteOrder
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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

