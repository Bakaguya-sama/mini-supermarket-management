/**
 * cartService.js
 * Service layer để gắn API shopping cart từ backend
 * Xử lí tất cả cart operations: get, add, update, remove
 * 
 * Cart API Endpoints:
 * - GET /api/carts/customer/:customerId - Get/create cart for customer
 * - POST /api/carts/:cartId/items - Add item to cart
 * - PUT /api/carts/items/:itemId/quantity - Update item quantity
 * - DELETE /api/carts/items/:itemId - Remove item from cart
 * - DELETE /api/carts/:cartId/clear - Clear all items
 */

import apiClient from './apiClient';

const API_BASE_URL = '/carts';

export const cartService = {
  /**
   * Lấy cart của customer (tự động tạo nếu chưa có)
   * @param {string} customerId - Customer ID
   * @returns {Promise} { success, data: { _id, cartItems, subtotal, total, ... } }
   */
  getCartByCustomer: async (customerId) => {
    try {
      console.log(`🛒 Fetching cart for customer: ${customerId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/customer/${customerId}`);
      
      console.log('✅ Cart fetched successfully:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error(`❌ Error fetching cart for customer ${customerId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch cart',
        data: null
      };
    }
  },

  /**
   * Lấy cart by ID
   * @param {string} cartId - Cart ID
   * @returns {Promise} { success, data }
   */
  getCartById: async (cartId) => {
    try {
      console.log(`🛒 Fetching cart: ${cartId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${cartId}`);
      
      console.log('✅ Cart fetched:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error(`❌ Error fetching cart ${cartId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch cart',
        data: null
      };
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {string} cartId - Cart ID
   * @param {string} productId - Product ID  
   * @param {number} quantity - Số lượng
   * @returns {Promise} { success, data: updatedCart }
   */
  addItem: async (cartId, productId, quantity = 1) => {
    try {
      console.log(`🛒 Adding item to cart ${cartId}:`, { productId, quantity });
      
      const response = await apiClient.post(`${API_BASE_URL}/${cartId}/items`, {
        product_id: productId,
        quantity: quantity
      });
      
      console.log('✅ Item added to cart:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Item added to cart'
      };
    } catch (error) {
      console.error(`❌ Error adding item to cart:`, error);
      return {
        success: false,
        message: error.message || 'Failed to add item to cart',
        data: null
      };
    }
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * @param {string} itemId - Cart Item ID
   * @param {number} quantity - Số lượng mới (nếu 0 sẽ xóa)
   * @returns {Promise} { success, data: updatedCart }
   */
  updateQuantity: async (itemId, quantity) => {
    try {
      console.log(`🛒 Updating item ${itemId} quantity to:`, quantity);
      
      const response = await apiClient.put(`${API_BASE_URL}/items/${itemId}/quantity`, {
        quantity: quantity
      });
      
      console.log('✅ Item quantity updated:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Quantity updated'
      };
    } catch (error) {
      console.error(`❌ Error updating quantity:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update quantity',
        data: null
      };
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {string} itemId - Cart Item ID
   * @returns {Promise} { success, data: updatedCart }
   */
  removeItem: async (itemId) => {
    try {
      console.log(`🛒 Removing item from cart: ${itemId}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/items/${itemId}`);
      
      console.log('✅ Item removed from cart:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Item removed from cart'
      };
    } catch (error) {
      console.error(`❌ Error removing item:`, error);
      return {
        success: false,
        message: error.message || 'Failed to remove item',
        data: null
      };
    }
  },

  /**
   * Xóa tất cả sản phẩm khỏi giỏ
   * @param {string} cartId - Cart ID
   * @returns {Promise} { success, data: updatedCart }
   */
  clearCart: async (cartId) => {
    try {
      console.log(`🛒 Clearing cart: ${cartId}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${cartId}/clear`);
      
      console.log('✅ Cart cleared:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Cart cleared'
      };
    } catch (error) {
      console.error(`❌ Error clearing cart:`, error);
      return {
        success: false,
        message: error.message || 'Failed to clear cart',
        data: null
      };
    }
  },

  /**
   * Apply promo code to cart
   * @param {string} cartId - Cart ID
   * @param {string} promoId - Promotion ID
   * @returns {Promise} { success, data: updatedCart }
   */
  applyPromo: async (cartId, promoId) => {
    try {
      console.log(`🛒 Applying promo to cart ${cartId}:`, promoId);
      
      const response = await apiClient.post(`${API_BASE_URL}/${cartId}/apply-promo`, {
        promo_id: promoId
      });
      
      console.log('✅ Promo applied:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Promo applied'
      };
    } catch (error) {
      console.error(`❌ Error applying promo:`, error);
      return {
        success: false,
        message: error.message || 'Failed to apply promo',
        data: null
      };
    }
  },

  /**
   * Remove promo code from cart
   * @param {string} cartId - Cart ID
   * @returns {Promise} { success, data: updatedCart }
   */
  removePromo: async (cartId) => {
    try {
      console.log(`🛒 Removing promo from cart: ${cartId}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${cartId}/remove-promo`);
      
      console.log('✅ Promo removed:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Promo removed'
      };
    } catch (error) {
      console.error(`❌ Error removing promo:`, error);
      return {
        success: false,
        message: error.message || 'Failed to remove promo',
        data: null
      };
    }
  },

  /**
   * Checkout cart (chuyển status sang 'checked_out')
   * @param {string} cartId - Cart ID
   * @returns {Promise} { success, data: updatedCart }
   */
  checkout: async (cartId) => {
    try {
      console.log(`🛒 Checking out cart: ${cartId}`);
      
      const response = await apiClient.patch(`${API_BASE_URL}/${cartId}/checkout`, {});
      
      console.log('✅ Cart checked out:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Cart checked out'
      };
    } catch (error) {
      console.error(`❌ Error checking out cart:`, error);
      return {
        success: false,
        message: error.message || 'Failed to checkout cart',
        data: null
      };
    }
  }
};

export default cartService;
