// server/repositories/OrderRepository.js
const { Order, OrderItem, Cart, CartItem } = require('../models');

class OrderRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await Order.find(query)
      .populate('customer_id', 'account_id membership_type points_balance total_spent')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product_id',
          select: 'name price category sku unit'
        }
      })
      .populate('payment_id', 'payment_method status payment_date')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(query) {
    return await Order.countDocuments(query);
  }

  async findById(id) {
    return await Order.findById(id)
      .populate('customer_id', 'account_id membership_type points_balance')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product_id',
          select: 'name price category sku unit'
        }
      })
      .populate('payment_id', 'payment_method status payment_date');
  }

  async create(orderData) {
    return await Order.create(orderData);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const defaultOptions = { new: true, runValidators: true };
    return await Order.findByIdAndUpdate(
      id,
      updateData,
      { ...defaultOptions, ...options }
    )
      .populate('customer_id', 'account_id membership_type')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product_id',
          select: 'name price'
        }
      });
  }

  async findByCustomerId(customerId, { skip = 0, limit = 10, sort = '-createdAt' } = {}) {
    return await Order.find({
      customer_id: customerId,
      isDelete: false
    })
      .populate({
        path: 'orderItems',
        select: 'quantity unit_price status product_id',
        populate: {
          path: 'product_id',
          select: 'name price category sku unit'
        }
      })
      .populate('payment_id', 'payment_method status')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByCustomerId(customerId) {
    return await Order.countDocuments({
      customer_id: customerId,
      isDelete: false
    });
  }

  async findByStatus(status, { skip = 0, limit = 10 } = {}) {
    return await Order.find({
      status,
      isDelete: false
    })
      .populate('customer_id', 'account_id')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt')
      .lean();
  }

  async countByStatus(status) {
    return await Order.countDocuments({
      status,
      isDelete: false
    });
  }

  async softDelete(id) {
    return await Order.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
  }

  async aggregate(pipeline) {
    return await Order.aggregate(pipeline);
  }

  async findByOrderNumber(orderNumber) {
    return await Order.findOne({
      order_number: orderNumber,
      isDelete: false
    });
  }

  async findByTrackingNumber(trackingNumber) {
    return await Order.findOne({
      tracking_number: trackingNumber,
      isDelete: false
    });
  }

  // Get order items for an order
  async getOrderItems(orderId) {
    return await OrderItem.find({
      order_id: orderId,
      isDelete: false
    })
      .populate('product_id', 'name sku category retail_price current_stock')
      .populate({
        path: 'warehouse_issued_by_staff_id',
        select: 'account_id',
        populate: {
          path: 'account_id',
          select: 'full_name'
        }
      })
      .lean();
  }

  // Create order items in bulk
  async createOrderItems(itemsData) {
    return await OrderItem.insertMany(itemsData);
  }

  // Get cart with items
  async getCartWithItems(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const cartItems = await CartItem.find({
      cart_id: cartId,
      status: 'active'
    })
      .populate('product_id')
      .lean();

    return {
      cart,
      cartItems
    };
  }

  // Update cart status after order creation
  async updateCartStatus(cartId, status) {
    return await Cart.findByIdAndUpdate(
      cartId,
      {
        status,
        cartItems: []
      },
      { new: true }
    );
  }

  // Mark cart items as purchased
  async markCartItemsAsPurchased(cartId) {
    return await CartItem.updateMany(
      { cart_id: cartId },
      { status: 'purchased' }
    );
  }
}

module.exports = new OrderRepository();
