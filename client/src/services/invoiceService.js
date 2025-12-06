import apiClient from './apiClient';

/**
 * Invoice Management Service
 * Handles all invoice-related API calls
 */

const invoiceService = {
  /**
   * Get paginated list of invoices
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (unpaid, partial, paid)
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await apiClient.get(`/invoices?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>} Invoice data with items
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoices by customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} List of customer invoices
   */
  getByCustomer: async (customerId) => {
    try {
      const response = await apiClient.get(`/invoices/customer/${customerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Invoice data
   */
  getByOrder: async (orderId) => {
    try {
      const response = await apiClient.get(`/invoices/order/${orderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/invoices/statistics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new invoice from order
   * @param {Object} data - Invoice data
   * @param {string} data.orderId - Order ID
   * @param {Array} data.items - Invoice items
   * @returns {Promise<Object>} Created invoice
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/invoices', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} data - Updated invoice data
   * @returns {Promise<Object>} Updated invoice
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoices/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invoice payment status
   * @param {string} id - Invoice ID
   * @param {string} status - New status (unpaid, partial, paid)
   * @returns {Promise<Object>} Updated invoice
   */
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/invoices/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default invoiceService;
