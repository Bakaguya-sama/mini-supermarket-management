import apiClient from './apiClient';

/**
 * Order Management Service
 * Handles all order-related API calls
 */

const orderService = {
  /**
   * Get paginated list of orders
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (pending, confirmed, shipped, delivered, cancelled)
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await apiClient.get(`/orders?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data with items
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Promise<Array>} List of orders
   */
  getByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/orders/status/${status}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer's orders
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} List of customer orders
   */
  getByCustomer: async (customerId) => {
    try {
      const response = await apiClient.get(`/orders/customer/${customerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/orders/statistics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new order
   * @param {Object} data - Order data
   * @param {string} data.customerId - Customer ID
   * @param {Array} data.items - Order items array
   * @param {number} data.totalAmount - Total order amount
   * @returns {Promise<Object>} Created order
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/orders', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} data - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/orders/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete order (only pending orders can be deleted)
   * @param {string} id - Order ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;
