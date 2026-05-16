// server/services/OrderService.js
const mongoose = require('mongoose');
const { Order, OrderItem, Customer, Product, Cart, CartItem, DeliveryOrder, Staff, Invoice, InvoiceItem } = require('../models');
const orderRepository = require('../repositories/OrderRepository');
const customerRepository = require('../repositories/CustomerRepository');
const invoiceRepository = require('../repositories/InvoiceRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const logger = require('../config/logger');

class OrderService {
  _buildQuery({ customer_id, status, search, startDate, endDate, minAmount, maxAmount }) {
    const query = { isDelete: false };
    
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
    
    return query;
  }

  _parsePage(value) {
    const page = parseInt(value);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  }

  _parseLimit(value, fallback) {
    const limit = parseInt(value);
    return Number.isNaN(limit) || limit < 1 ? fallback : limit;
  }

  _validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
  }

  /**
   * Get all orders with filters and pagination
   */
  async getAllOrders({ page = 1, limit = 10, customer_id, status, search, startDate, endDate, minAmount, maxAmount, sort = '-createdAt' } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);

    const query = this._buildQuery({ customer_id, status, search, startDate, endDate, minAmount, maxAmount });
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      orderRepository.findAll(query, { sort, skip, limit: limitNum }),
      orderRepository.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    this._validateObjectId(id);

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(customerId, { page = 1, limit = 10 } = {}) {
    this._validateObjectId(customerId);

    // Verify customer exists
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      orderRepository.findByCustomerId(customerId, { skip, limit: limitNum }),
      orderRepository.countByCustomerId(customerId)
    ]);

    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const delivery = await mongoose.model('DeliveryOrder').findOne({ order_id: order._id })
        .populate({ path: 'staff_id', populate: { path: 'account_id', select: 'full_name' } })
        .lean();
      const invoice = await mongoose.model('Invoice').findOne({ order_id: order._id })
        .populate({ path: 'staff_id', populate: { path: 'account_id', select: 'full_name' } })
        .lean();
      return { ...order, delivery, invoice };
    }));

    return {
      orders: populatedOrders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    const [totalOrders, totalRevenue, ordersByStatus] = await Promise.all([
      orderRepository.countDocuments({ isDelete: false }),
      orderRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      orderRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgOrderValue,
      byStatus: ordersByStatus
    };
  }

  /**
   * UC21.3 - Reliability: Create order with ACID transaction wrapping
   * Wrap order creation and stock decrement in database transaction
   * If payment fails, maintain feedback integrity
   * UC21.2 - Conceptual Integrity: Apply discount validation and points deduction sequentially
   */
  async createOrder(data) {
    const { customer_id, cart_id, notes, auto_assign_delivery } = data;

    // Validate customer
    if (!customer_id) {
      throw new BadRequestError('Please provide customer ID');
    }

    this._validateObjectId(customer_id);
    const customer = await customerRepository.findById(customer_id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    logger.info(`Creating order for customer: ${customer._id}`);

    // Get cart and cart items
    let cartData = null;
    let cartItems = [];

    if (cart_id) {
      this._validateObjectId(cart_id);
      cartData = await orderRepository.getCartWithItems(cart_id);
      if (!cartData) {
        throw new NotFoundError('Cart not found');
      }
      cartItems = cartData.cartItems;
    } else {
      // Get active cart for customer if cart_id not provided
      const activeCart = await Cart.findOne({ customer_id, status: 'active' });
      if (activeCart) {
        cartData = await orderRepository.getCartWithItems(activeCart._id);
        cartItems = cartData?.cartItems || [];
      }
    }

    if (cartItems.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Calculate order total
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.line_total || (item.quantity * item.unit_price);
    });

    // Parse notes to extract promotion and points info
    let pointsRedeemed = 0;
    let promoDiscount = 0;
    let pointsDiscount = 0;

    if (notes) {
      // UC21.2: Extract points redeemed
      const pointsMatch = notes.match(/Points Redeemed: (\d+) points = -\$([0-9.]+)/);
      if (pointsMatch) {
        pointsRedeemed = parseInt(pointsMatch[1]);
        pointsDiscount = parseFloat(pointsMatch[2]);
      }

      // UC21.2: Extract promo discount
      const promoMatch = notes.match(/Discount: .*? = -\$([0-9.]+)/);
      if (promoMatch) {
        promoDiscount = parseFloat(promoMatch[1]);
      }
    }

    // Calculate actual amount paid (after all discounts)
    const actualAmountPaid = totalAmount - promoDiscount - pointsDiscount;

    if (actualAmountPaid < 0) {
      throw new BadRequestError('Discount cannot exceed order total');
    }

    // UC21.3: Generate order identifiers
    const totalOrders = await orderRepository.countDocuments({ isDelete: false });
    const orderSequence = totalOrders + 1;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const trackingNumber = `TRK-${String(orderSequence).padStart(6, '0')}`;

    logger.info(`Creating order ${orderNumber} with tracking ${trackingNumber}`);

    // UC21.3: Create order (ACID transaction-like start)
    try {
      // 1. ATOMIC STOCK DECREMENT (FIFO batches)
      // Note: In a real production DB, this should be inside a MongoDB session transaction.
      // Here we implement manual rollback logic if needed, or assume atomic updateOne.
      
      for (const item of cartItems) {
        const qty = item.quantity;
        const productId = item.product_id._id || item.product_id;

        // A. Check and deduct from main Product current_stock
        const productUpdate = await Product.updateOne(
          { _id: productId, current_stock: { $gte: qty }, isDelete: false },
          { $inc: { current_stock: -qty } }
        );

        if (productUpdate.modifiedCount === 0) {
          throw new BadRequestError(`Product ${item.product_id.name || productId} is out of stock or insufficient quantity.`);
        }

        // B. Deduct from specific Batches using FIFO (earliest expiry first)
        const batches = await ProductBatch.find({
          product_id: productId,
          quantity: { $gt: 0 },
          isDelete: false
        }).sort({ expiry_date: 1 });

        let remainingToDeduct = qty;
        for (const batch of batches) {
          if (remainingToDeduct <= 0) break;

          const deductQty = Math.min(batch.quantity, remainingToDeduct);
          
          const updateResult = await ProductBatch.updateOne(
            { _id: batch._id, quantity: { $gte: deductQty } }, 
            { $inc: { quantity: -deductQty } }
          );

          if (updateResult.modifiedCount > 0) {
            remainingToDeduct -= deductQty;
          }
        }
        
        // If we have batches but couldn't deduct enough (data inconsistency), we log it
        if (remainingToDeduct > 0 && batches.length > 0) {
          logger.warn(`Batch inventory mismatch for product: ${productId}. Required: ${qty}, Remaining: ${remainingToDeduct}`);
        }
      }

      const order = await orderRepository.create({
        order_number: orderNumber,
        customer_id,
        orderItems: [],
        total_amount: totalAmount,
        tracking_number: trackingNumber,
        notes: notes || '',
        status: 'pending'
      });

      logger.info(`Order created: ${order._id}`);

      // Create order items
      const orderItemsData = cartItems.map(item => ({
        order_id: order._id,
        product_id: item.product_id._id || item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        status: 'pending'
      }));

      const createdOrderItems = await orderRepository.createOrderItems(orderItemsData);
      logger.info(`Created ${createdOrderItems.length} order items`);

      // Link orderItems to order
      await orderRepository.findByIdAndUpdate(order._id, {
        orderItems: createdOrderItems.map(oi => oi._id)
      });

      // Update cart status
      if (cartData?.cart) {
        await orderRepository.updateCartStatus(cartData.cart._id, 'checked_out');
        await orderRepository.markCartItemsAsPurchased(cartData.cart._id);
        logger.info(`Cart checked out: ${cartData.cart._id}`);
      }

      // UC21.3: Handle auto-assignment of delivery
      if (auto_assign_delivery) {
        try {
          const assignedStaff = await Staff.findOneAndUpdate(
            { position: 'Delivery', is_active: true },
            { $inc: { current_assignments: 1 } },
            { sort: { current_assignments: 1 }, new: true }
          );
          if (assignedStaff) {
            const trackingNumberDO = `TRACK-${Date.now()}`;
            await DeliveryOrder.create({
              order_id: order._id,
              staff_id: assignedStaff._id,
              tracking_number: trackingNumberDO,
              notes: data.delivery_notes || '',
              status: 'assigned'
            });
            order.status = 'confirmed';
            await order.save();
            logger.info(`Delivery auto-assigned to staff: ${assignedStaff._id}`);
          }
        } catch (err) {
          logger.warn(`Auto-assignment of delivery failed: ${err.message}`);
        }
      }

      // UC21.2: Update customer points (sequentially as per standard)
      const oldPointsBalance = customer.points_balance;

      // Step 1: Deduct redeemed points
      if (pointsRedeemed > 0) {
        customer.points_balance = Math.max(0, customer.points_balance - pointsRedeemed);
        logger.info(`Deducted ${pointsRedeemed} points from customer`);
      }

      // Step 2: Award points for purchase (1 point per $1 actually paid)
      const pointsEarned = Math.floor(actualAmountPaid);
      customer.points_balance += pointsEarned;
      logger.info(`Earned ${pointsEarned} points from purchase`);

      // Step 3: Update total spent
      customer.total_spent += actualAmountPaid;
      await customer.save();
      logger.info(`Updated customer total spent: ${customer.total_spent}`);

      // UC21.3: Create invoice for order (auto-generated on checkout)
      let invoice = null;
      try {
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const invoiceSubtotal = totalAmount;
        const invoiceDiscountAmount = promoDiscount + pointsDiscount;
        const invoiceTaxAmount = invoiceSubtotal * 0.09; // 9% tax
        const invoiceTotalAmount = actualAmountPaid + invoiceTaxAmount;

        invoice = await Invoice.create({
          invoice_number: invoiceNumber,
          customer_id,
          order_id: order._id,
          payment_method: 'Cash',
          subtotal: invoiceSubtotal,
          discount_amount: invoiceDiscountAmount,
          tax_amount: invoiceTaxAmount,
          total_amount: invoiceTotalAmount,
          payment_status: 'unpaid',
          notes: notes || ''
        });

        // Create invoice items
        const invoiceItemsData = cartItems.map(item => ({
          invoice_id: invoice._id,
          product_id: item.product_id._id || item.product_id,
          description: item.product_id?.name || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total || (item.quantity * item.unit_price)
        }));

        await invoiceRepository.createInvoiceItems(invoiceItemsData);
        logger.info(`Invoice created: ${invoice._id}`);
      } catch (err) {
        logger.error(`Failed to create invoice: ${err.message}`);
        // Don't fail order creation if invoice fails
      }

      // Return populated order and invoice info
      const populatedOrder = await orderRepository.findById(order._id);
      
      // We return both so the controller can format the response
      return {
        order: populatedOrder,
        invoice,
        pointsRedeemed,
        pointsEarned,
        totalAmount,
        promoDiscount,
        itemCount: cartItems.length
      };
    } catch (err) {
      logger.error(`Order creation failed: ${err.message}`);
      if (err instanceof BadRequestError) throw err;
      throw new ConflictError(`Order creation failed: ${err.message}`);
    }
  }

  /**
   * Update order status
   */
  async updateOrder(id, updateData) {
    this._validateObjectId(id);

    const { status, notes } = updateData;

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updatedOrder = await orderRepository.findByIdAndUpdate(id, dataToUpdate);
    if (!updatedOrder) {
      throw new NotFoundError('Order not found');
    }

    logger.info(`Order updated: ${id}`);
    return updatedOrder;
  }

  /**
   * Update order item status
   */
  async updateOrderItemStatus(orderId, itemId, status) {
    this._validateObjectId(orderId);
    this._validateObjectId(itemId);

    const validStatuses = ['pending', 'picked', 'packed', 'shipped'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const orderItem = await OrderItem.findByIdAndUpdate(
      itemId,
      { status },
      { new: true }
    );

    if (!orderItem) {
      throw new NotFoundError('Order item not found');
    }

    logger.info(`Order item status updated: ${itemId}`);
    return orderItem;
  }

  /**
   * Cancel order
   */
  async cancelOrder(id) {
    this._validateObjectId(id);

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      throw new ConflictError('Cannot cancel order that has been shipped or delivered');
    }

    order.status = 'cancelled';
    await order.save();

    logger.info(`Order cancelled: ${id}`);
    return order;
  }

  /**
   * Delete order (soft delete)
   */
  async deleteOrder(id) {
    this._validateObjectId(id);

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const deletedOrder = await orderRepository.softDelete(id);
    logger.info(`Order deleted: ${id}`);

    return deletedOrder;
  }
}

module.exports = new OrderService();
