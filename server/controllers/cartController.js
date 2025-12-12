// controllers/cartController.js - VIẾT LẠI HOÀN TOÀN
const { Cart, CartItem, Product, Customer, Promotion } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Get cart by customer ID (hoặc tạo mới nếu chưa có)
 * @route   GET /api/carts/:customerId
 * @access  Public
 */
exports.getCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customerId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Find active cart
    let cart = await Cart.findOne({ 
      customer_id: customerId, 
      status: 'active',
      isDelete: false 
    });

    // Nếu chưa có cart, tạo mới
    if (!cart) {
      cart = await Cart.create({
        customer_id: customerId,
        status: 'active',
        currency: 'VND',
        subtotal: 0,
        discounts: 0,
        total: 0
      });
    }

    // Get cart items with product details
    const cartItems = await CartItem.find({ 
      cart_id: cart._id, 
      status: 'active',
      isDelete: false 
    }).populate('product_id', 'name price unit image_link current_stock');

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.line_total, 0);
    const total = subtotal - cart.discounts;

    // Update cart totals
    cart.subtotal = subtotal;
    cart.total = total;
    cart.last_activity_at = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        cart,
        items: cartItems,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/carts/:customerId/items
 * @access  Public
 */
exports.addItemToCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check product exists and available
    const product = await Product.findOne({ 
      _id: product_id, 
      isDelete: false 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check stock
    if (product.current_stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.current_stock}`,
        available_stock: product.current_stock
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ 
      customer_id: customerId, 
      status: 'active',
      isDelete: false 
    });

    if (!cart) {
      cart = await Cart.create({
        customer_id: customerId,
        status: 'active'
      });
    }

    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id: product_id,
      status: 'active',
      isDelete: false
    });

    if (cartItem) {
      // Update existing item
      const newQuantity = cartItem.quantity + quantity;
      
      // Check stock for new quantity
      if (product.current_stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available: ${product.current_stock}`,
          current_in_cart: cartItem.quantity,
          available_stock: product.current_stock
        });
      }

      cartItem.quantity = newQuantity;
      cartItem.line_total = newQuantity * product.price;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id: product_id,
        product_name: product.name,
        quantity: quantity,
        unit: product.unit,
        unit_price: product.price,
        line_total: quantity * product.price,
        status: 'active'
      });
    }

    // Update cart totals
    const allItems = await CartItem.find({ 
      cart_id: cart._id, 
      status: 'active',
      isDelete: false 
    });
    
    const subtotal = allItems.reduce((sum, item) => sum + item.line_total, 0);
    cart.subtotal = subtotal;
    cart.total = subtotal - cart.discounts;
    cart.last_activity_at = new Date();
    await cart.save();

    // Populate product details
    await cartItem.populate('product_id', 'name price unit image_link current_stock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cartItem,
        cart: {
          subtotal: cart.subtotal,
          discounts: cart.discounts,
          total: cart.total,
          itemCount: allItems.length
        }
      }
    });
  } catch (error) {
    console.error('Error in addItemToCart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/carts/items/:cartItemId
 * @access  Public
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({ 
      _id: cartItemId, 
      isDelete: false 
    }).populate('product_id');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock
    if (cartItem.product_id.current_stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${cartItem.product_id.current_stock}`,
        available_stock: cartItem.product_id.current_stock
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    cartItem.line_total = quantity * cartItem.unit_price;
    await cartItem.save();

    // Update cart totals
    const cart = await Cart.findById(cartItem.cart_id);
    const allItems = await CartItem.find({ 
      cart_id: cart._id, 
      status: 'active',
      isDelete: false 
    });
    
    const subtotal = allItems.reduce((sum, item) => sum + item.line_total, 0);
    cart.subtotal = subtotal;
    cart.total = subtotal - cart.discounts;
    cart.last_activity_at = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cartItem,
        cart: {
          subtotal: cart.subtotal,
          discounts: cart.discounts,
          total: cart.total
        }
      }
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/carts/items/:cartItemId
 * @access  Public
 */
exports.removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    // Find and delete cart item
    const cartItem = await CartItem.findOne({ 
      _id: cartItemId, 
      isDelete: false 
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = cartItem.cart_id;

    // Soft delete
    cartItem.isDelete = true;
    cartItem.status = 'removed';
    await cartItem.save();

    // Update cart totals
    const cart = await Cart.findById(cartId);
    const remainingItems = await CartItem.find({ 
      cart_id: cartId, 
      status: 'active',
      isDelete: false 
    });
    
    const subtotal = remainingItems.reduce((sum, item) => sum + item.line_total, 0);
    cart.subtotal = subtotal;
    cart.total = subtotal - cart.discounts;
    cart.last_activity_at = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          subtotal: cart.subtotal,
          discounts: cart.discounts,
          total: cart.total,
          itemCount: remainingItems.length
        }
      }
    });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
};

/**
 * @desc    Clear all items from cart
 * @route   DELETE /api/carts/:customerId/clear
 * @access  Public
 */
exports.clearCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customerId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      customer_id: customerId, 
      status: 'active',
      isDelete: false 
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Soft delete all cart items
    await CartItem.updateMany(
      { cart_id: cart._id, isDelete: false },
      { $set: { isDelete: true, status: 'removed' } }
    );

    // Reset cart totals
    cart.subtotal = 0;
    cart.discounts = 0;
    cart.total = 0;
    cart.applied_promo_id = null;
    cart.last_activity_at = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

/**
 * @desc    Apply promotion to cart
 * @route   POST /api/carts/:customerId/apply-promo
 * @access  Public
 */
exports.applyPromotion = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { promo_code } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!promo_code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      customer_id: customerId, 
      status: 'active',
      isDelete: false 
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find promotion
    const promotion = await Promotion.findOne({ 
      promo_code: promo_code,
      is_active: true,
      isDelete: false
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive promo code'
      });
    }

    // Check if promotion is valid (dates)
    const now = new Date();
    if (now < promotion.start_date || now > promotion.end_date) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired or not yet active'
      });
    }

    // Check minimum purchase amount
    if (cart.subtotal < promotion.minimum_purchase_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is ${promotion.minimum_purchase_amount}. Current: ${cart.subtotal}`
      });
    }

    // Calculate discount
    let discount = 0;
    if (promotion.promotion_type === 'percentage') {
      discount = (cart.subtotal * promotion.discount_value) / 100;
    } else if (promotion.promotion_type === 'fixed') {
      discount = promotion.discount_value;
    }

    // Apply discount
    cart.applied_promo_id = promotion._id;
    cart.discounts = discount;
    cart.total = cart.subtotal - discount;
    cart.last_activity_at = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Promotion applied successfully',
      data: {
        cart,
        promotion: {
          code: promotion.promo_code,
          name: promotion.name,
          discount: discount
        }
      }
    });
  } catch (error) {
    console.error('Error in applyPromotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promotion',
      error: error.message
    });
  }
};

/**
 * @desc    Get cart by ID (for admin)
 * @route   GET /api/carts/admin/:cartId
 * @access  Private/Admin
 */
exports.getCartById = async (req, res) => {
  try {
    const { cartId } = req.params;

    // Validate cartId
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart ID'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      _id: cartId, 
      isDelete: false 
    }).populate('customer_id', 'account_id membership_type points_balance');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Get cart items
    const cartItems = await CartItem.find({ 
      cart_id: cart._id, 
      isDelete: false 
    }).populate('product_id', 'name price unit image_link current_stock');

    res.status(200).json({
      success: true,
      data: {
        cart,
        items: cartItems,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error in getCartById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};
