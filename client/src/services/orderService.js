/**
 * orderService.js
 * Service layer để gắn API orders từ backend
 * Xử lý tất cả order operations: get, create, update, cancel
 * 
 * Order API Endpoints:
 * - GET /api/orders - Get all orders
 * - GET /api/orders/:id - Get order by ID
 * - GET /api/orders/customer/:customerId - Get customer orders
 * - POST /api/orders - Create order from cart
 * - PUT /api/orders/:id - Update order
 * - PATCH /api/orders/:id/cancel - Cancel order
 * - DELETE /api/orders/:id - Delete order
 */

import apiClient from './apiClient';

const API_BASE_URL = '/orders';

export const orderService = {
  /**
   * Lấy tất cả đơn hàng
   * @param {object} params - Query parameters (page, limit, status, customer_id, etc.)
   * @returns {Promise} { success, data: orders[], total, page, pages }
   */
  getAllOrders: async (params = {}) => {
    try {
      console.log('📦 Fetching all orders with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      console.log('✅ Orders fetched successfully:', response);
      return {
        success: response.success !== false,
        data: response.data || [],
        total: response.total,
        page: response.page,
        pages: response.pages,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch orders',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Lấy đơn hàng theo ID
   * @param {string} orderId - Order ID
   * @returns {Promise} { success, data: order }
   */
  getOrderById: async (orderId) => {
    try {
      console.log(`📦 Fetching order: ${orderId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${orderId}`);
      
      console.log('✅ Order fetched:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error(`❌ Error fetching order ${orderId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch order',
        data: null
      };
    }
  },

  /**
   * Lấy đơn hàng của customer
   * @param {string} customerId - Customer ID
   * @param {object} params - Query parameters (page, limit, status)
   * @returns {Promise} { success, data: orders[], total, page, pages }
   */
  getOrdersByCustomer: async (customerId, params = {}) => {
    try {
      console.log(`📦 Fetching orders for customer: ${customerId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/customer/${customerId}`, { params });
      
      console.log(`✅ Customer orders fetched (${response.count || 0} orders):`, response);
      return {
        success: response.success !== false,
        data: response.data || [],
        customer: response.customer,
        total: response.total,
        page: response.page,
        pages: response.pages,
        message: response.message
      };
    } catch (error) {
      console.error(`❌ Error fetching customer orders:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customer orders',
        data: [],
        total: 0
      };
    }
  },

  /**
   * Tạo đơn hàng từ giỏ hàng
   * @param {object} orderData - { customer_id, cart_id, notes }
   * @returns {Promise} { success, data: newOrder }
   */
  createOrder: async (orderData) => {
    try {
      console.log('📦 Creating order:', orderData);
      
      const response = await apiClient.post(API_BASE_URL, orderData);
      
      console.log('✅ Order created:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Order created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order',
        data: null
      };
    }
  },

  /**
   * Cập nhật đơn hàng
   * @param {string} orderId - Order ID
   * @param {object} updateData - Data to update
   * @returns {Promise} { success, data: updatedOrder }
   */
  updateOrder: async (orderId, updateData) => {
    try {
      console.log(`📦 Updating order ${orderId}:`, updateData);
      
      const response = await apiClient.put(`${API_BASE_URL}/${orderId}`, updateData);
      
      console.log('✅ Order updated:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Order updated successfully'
      };
    } catch (error) {
      console.error(`❌ Error updating order:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update order',
        data: null
      };
    }
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderId - Order ID
   * @returns {Promise} { success, data: cancelledOrder }
   */
  cancelOrder: async (orderId) => {
    try {
      console.log(`📦 Cancelling order: ${orderId}`);
      
      const response = await apiClient.patch(`${API_BASE_URL}/${orderId}/cancel`);
      
      console.log('✅ Order cancelled:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Order cancelled successfully'
      };
    } catch (error) {
      console.error(`❌ Error cancelling order:`, error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
        data: null
      };
    }
  },

  /**
   * Xóa đơn hàng (admin only)
   * @param {string} orderId - Order ID
   * @returns {Promise} { success, message }
   */
  deleteOrder: async (orderId) => {
    try {
      console.log(`📦 Deleting order: ${orderId}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${orderId}`);
      
      console.log('✅ Order deleted');
      return {
        success: response.success !== false,
        message: response.message || 'Order deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting order:`, error);
      return {
        success: false,
        message: error.message || 'Failed to delete order'
      };
    }
  },

  /**
   * Lấy thống kê đơn hàng
   * @returns {Promise} { success, data: stats }
   */
  getOrderStats: async () => {
    try {
      console.log('📦 Fetching order stats');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats`);
      
      console.log('✅ Order stats fetched:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch order stats',
        data: null
      };
    }
  }
};

export default orderService;
