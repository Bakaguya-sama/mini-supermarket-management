// controllers/cartController.js - SHOPPING CART API HOÀN CHỈNH
const { Cart, CartItem, Product, Customer } = require('../models');
const mongoose = require('mongoose');
const redisClient = require('../config/redis');
const logger = require('../config/logger');

const CART_CACHE_TTL = 900; // 15 minutes

const cartCacheKey = (cartId) => `cart:session:${cartId}`;
const customerCartCacheKey = (customerId) => `cart:session:customer:${customerId}`;

async function readCartCacheByCustomer(customerId) {
  try {
    const cached = await redisClient.get(customerCartCacheKey(customerId));
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (error) {
    logger.warn(`Cart cache read failed: ${error.message}`);
    return null;
  }
}

async function writeCartCache(cart, customerId) {
  try {
    if (!cart) return;
    const payload = cart.toObject ? cart.toObject() : cart;
    const cartId = payload?._id || cart._id;
    if (!cartId) return;

    const tasks = [
      redisClient.setex(cartCacheKey(cartId), CART_CACHE_TTL, JSON.stringify(payload))
    ];

    if (customerId) {
      tasks.push(
        redisClient.setex(customerCartCacheKey(customerId), CART_CACHE_TTL, JSON.stringify(payload))
      );
    }

    await Promise.all(tasks);
  } catch (error) {
    logger.warn(`Cart cache write failed: ${error.message}`);
  }
}

/**
 * @desc    Get cart for customer (auto-create if not exists)
 * @route   GET /api/carts/customer/:customerId
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/customer/{customerId}:
 *   get:
 *     tags: [cart]
 *     summary: get Cart By Customer
 *     operationId: getCartByCustomer
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
exports.getCartByCustomer = async (req, res) => {
  try {
    console.log(`🛒 Fetching cart for customer: ${req.params.customerId}`);

    const cachedCart = await readCartCacheByCustomer(req.params.customerId);
    if (cachedCart) {
      return res.status(200).json({
        success: true,
        data: cachedCart
      });
    }
    
    let cart = await Cart.findOne({
      customer_id: req.params.customerId,
      status: 'active'
    }).populate({
      path: 'cartItems',
      populate: { path: 'product_id', select: 'name price sku unit' }
    }).populate('customer_id', 'account_id');

    // Auto-create cart if not exists
    if (!cart) {
      console.log(`📝 Creating new cart for customer: ${req.params.customerId}`);
      cart = await Cart.create({
        customer_id: req.params.customerId,
        cartItems: [],
        status: 'active',
        subtotal: 0,
        discounts: 0,
        total: 0
      });
      
      // Re-fetch to get proper population
      cart = await Cart.findById(cart._id)
        .populate({
          path: 'cartItems',
          populate: { path: 'product_id', select: 'name price sku unit' }
        })
        .populate('customer_id', 'account_id');
    }

    console.log(`✅ Cart fetched with ${cart.cartItems.length} items`);
    
    await writeCartCache(cart, req.params.customerId);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

/**
 * @desc    Get all carts with filters
 * @route   GET /api/carts
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/:
 *   get:
 *     tags: [cart]
 *     summary: get All Carts
 *     operationId: getAllCarts
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getAllCarts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, minAmount, maxAmount } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) query.total.$gte = parseFloat(minAmount);
      if (maxAmount) query.total.$lte = parseFloat(maxAmount);
    }

    const carts = await Cart.find(query)
      .populate({
        path: 'customer_id',
        select: 'account_id email'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Cart.countDocuments(query);

    res.status(200).json({
      success: true,
      count: carts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: carts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching carts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single cart by ID
 * @route   GET /api/carts/:id
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{id}:
 *   get:
 *     tags: [cart]
 *     summary: get Cart By Id
 *     operationId: getCartById
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
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id', select: 'name price sku unit description' }
      })
      .populate('customer_id', 'account_id')
      .populate('applied_promo_id', 'name discount_value');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/carts/:cartId/items
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{cartId}/items:
 *   post:
 *     tags: [cart]
 *     summary: add Item To Cart
 *     operationId: addItemToCart
 *     parameters:
 *       - in: path
 *         name: cartId
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
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.addItemToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID and quantity'
      });
    }

    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      cart_id: req.params.cartId,
      product_id,
      status: { $ne: 'removed' }  // Don't count removed items
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += parseInt(quantity);
      cartItem.line_total = cartItem.quantity * cartItem.unit_price;
      await cartItem.save();
      console.log(`📈 Updated existing item quantity to ${cartItem.quantity}`);
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: req.params.cartId,
        product_id,
        product_name: product.name,
        sku: product.sku,
        quantity: parseInt(quantity),
        unit: product.unit,
        unit_price: product.price,
        line_total: parseInt(quantity) * product.price,
        status: 'active'
      });
      console.log(`➕ Created new cart item`);
      
      // Add item to cart's cartItems array if not already present
      if (!cart.cartItems.includes(cartItem._id)) {
        cart.cartItems.push(cartItem._id);
        await cart.save();
      }
    }

    // Recalculate cart totals
    await calculateCartTotals(req.params.cartId);

    const updatedCart = await Cart.findById(req.params.cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id', select: 'name price sku unit' }
      });

    await writeCartCache(updatedCart, cart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/carts/items/:itemId/quantity
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/items/{itemId}/quantity:
 *   put:
 *     tags: [cart]
 *     summary: update Item Quantity
 *     operationId: updateItemQuantity
 *     parameters:
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
exports.updateItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const cartItem = await CartItem.findById(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = cartItem.cart_id;

    if (quantity === 0) {
      // Remove item if quantity is 0
      cartItem.status = 'removed';
      await cartItem.save();
      console.log(`🗑️  Item marked as removed`);
      
      // Remove from cart's cartItems array
      await Cart.findByIdAndUpdate(cartId, {
        $pull: { cartItems: cartItem._id }
      });
    } else {
      cartItem.quantity = parseInt(quantity);
      cartItem.line_total = parseInt(quantity) * cartItem.unit_price;
      cartItem.status = 'active';
      await cartItem.save();
      console.log(`📝 Item quantity updated to ${quantity}`);
    }

    // Recalculate cart totals
    await calculateCartTotals(cartId);

    const updatedCart = await Cart.findById(cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id', select: 'name price sku unit' }
      });

    await writeCartCache(updatedCart, updatedCart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Item quantity updated',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Error updating item quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item quantity',
      error: error.message
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/carts/items/:itemId
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/items/{itemId}:
 *   delete:
 *     tags: [cart]
 *     summary: remove Item From Cart
 *     operationId: removeItemFromCart
 *     parameters:
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
exports.removeItemFromCart = async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = cartItem.cart_id;

    // Mark as removed
    cartItem.status = 'removed';
    await cartItem.save();
    console.log(`🗑️  Item removed from cart`);

    // Remove from cart's cartItems array
    await Cart.findByIdAndUpdate(cartId, {
      $pull: { cartItems: cartItem._id }
    });

    // Recalculate cart totals
    await calculateCartTotals(cartId);

    const updatedCart = await Cart.findById(cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id', select: 'name price sku unit' }
      });

    await writeCartCache(updatedCart, updatedCart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart
    });
  } catch (error) {
    console.error('❌ Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

/**
 * @desc    Apply promo code to cart
 * @route   POST /api/carts/:cartId/apply-promo
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{cartId}/apply-promo:
 *   post:
 *     tags: [cart]
 *     summary: apply Promo
 *     operationId: applyPromo
 *     parameters:
 *       - in: path
 *         name: cartId
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
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.applyPromo = async (req, res) => {
  try {
    const { promo_id } = req.body;

    if (!promo_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide promo ID'
      });
    }

    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // In real scenario, verify promo code exists and is valid
    cart.applied_promo_id = promo_id;

    // Recalculate with discount
    await calculateCartTotals(req.params.cartId);

    const updatedCart = await Cart.findById(req.params.cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id' }
      })
      .populate('applied_promo_id');

    await writeCartCache(updatedCart, cart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Promo code applied',
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying promo',
      error: error.message
    });
  }
};

/**
 * @desc    Remove promo code from cart
 * @route   DELETE /api/carts/:cartId/remove-promo
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{cartId}/remove-promo:
 *   delete:
 *     tags: [cart]
 *     summary: remove Promo
 *     operationId: removePromo
 *     parameters:
 *       - in: path
 *         name: cartId
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
exports.removePromo = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.applied_promo_id = null;
    cart.discounts = 0;

    await calculateCartTotals(req.params.cartId);

    const updatedCart = await Cart.findById(req.params.cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id' }
      });

    await writeCartCache(updatedCart, cart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Promo code removed',
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing promo',
      error: error.message
    });
  }
};

/**
 * @desc    Clear cart (remove all items)
 * @route   DELETE /api/carts/:cartId/clear
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{cartId}/clear:
 *   delete:
 *     tags: [cart]
 *     summary: clear Cart
 *     operationId: clearCart
 *     parameters:
 *       - in: path
 *         name: cartId
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
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Mark all items as removed
    await CartItem.updateMany(
      { cart_id: req.params.cartId },
      { status: 'removed' }
    );

    // Reset cart
    cart.subtotal = 0;
    cart.discounts = 0;
    cart.total = 0;
    cart.applied_promo_id = null;
    await cart.save();

    await writeCartCache(cart, cart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

/**
 * @desc    Get cart statistics
 * @route   GET /api/carts/stats
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/stats:
 *   get:
 *     tags: [cart]
 *     summary: get Cart Stats
 *     operationId: getCartStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getCartStats = async (req, res) => {
  try {
    const totalCarts = await Cart.countDocuments();
    const activeCarts = await Cart.countDocuments({ status: 'active' });
    const abandonedCarts = await Cart.countDocuments({ status: 'abandoned' });
    const checkedOutCarts = await Cart.countDocuments({ status: 'checked_out' });

    const avgCartValue = await Cart.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgTotal: { $avg: '$total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCarts,
        activeCarts,
        abandonedCarts,
        checkedOutCarts,
        avgCartValue: avgCartValue[0]?.avgTotal || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Checkout cart (transition to checked_out)
 * @route   PATCH /api/carts/:cartId/checkout
 * @access  Public
 */
/**
 * @openapi
 * /api/carts/{cartId}/checkout:
 *   patch:
 *     tags: [cart]
 *     summary: checkout Cart
 *     operationId: checkoutCart
 *     parameters:
 *       - in: path
 *         name: cartId
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
exports.checkoutCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (cart.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active carts can be checked out'
      });
    }

    // Verify cart has items
    const activeItems = await CartItem.countDocuments({
      cart_id: req.params.cartId,
      status: 'active'
    });

    if (activeItems === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    cart.status = 'checked_out';
    await cart.save();

    const updatedCart = await Cart.findById(req.params.cartId)
      .populate({
        path: 'cartItems',
        populate: { path: 'product_id' }
      });

    await writeCartCache(updatedCart, cart.customer_id?.toString());

    res.status(200).json({
      success: true,
      message: 'Cart checked out successfully',
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking out cart',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate and update cart totals
 */
async function calculateCartTotals(cartId) {
  try {
    // Get all ACTIVE cart items (exclude removed, saved_for_later, purchased)
    const cartItems = await CartItem.find({
      cart_id: cartId,
      status: 'active'
    }).populate('product_id');

    console.log(`📊 Calculating totals for ${cartItems.length} active items`);

    // Calculate subtotal from active items only
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.line_total;
    });

    // Get cart and apply discount if promo exists
    const cart = await Cart.findById(cartId).populate('applied_promo_id');
    if (!cart) return;
    let discounts = 0;

    if (cart.applied_promo_id) {
      // Calculate discount based on promo type
      const promo = cart.applied_promo_id;
      if (promo.discount_type === 'percentage') {
        discounts = subtotal * (promo.discount_value / 100);
      } else if (promo.discount_type === 'fixed' || promo.discount_type === 'fixed_amount') {
        discounts = promo.discount_value;
      }
      console.log(`🏷️  Promo applied: ${discounts}`);
    }

    const total = Math.max(0, subtotal - discounts);

    // Update cart
    cart.subtotal = subtotal;
    cart.discounts = discounts;
    cart.total = total;
    cart.last_activity_at = new Date();
    await cart.save();
    
    console.log(`✅ Cart totals: subtotal=${subtotal}, discount=${discounts}, total=${total}`);
  } catch (error) {
    console.error('❌ Error calculating cart totals:', error);
  }
}

