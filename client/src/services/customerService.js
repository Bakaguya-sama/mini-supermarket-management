import apiClient from './apiClient';

/**
 * Customer Management Service
 * Handles all customer-related API calls
 */

const customerService = {
  /**
   * Get paginated list of customers
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.membership - Filter by membership type
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.membership) queryParams.append('membership', params.membership);

      const response = await apiClient.get(`/customers?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer by account ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Customer data
   */
  getByAccountId: async (accountId) => {
    try {
      const response = await apiClient.get(`/customers/account/${accountId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customers by membership type
   * @param {string} membership - Membership type (regular, silver, gold, platinum)
   * @returns {Promise<Array>} List of customers
   */
  getByMembership: async (membership) => {
    try {
      const response = await apiClient.get(`/customers/membership/${membership}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer statistics
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer statistics
   */
  getStatistics: async (id) => {
    try {
      const response = await apiClient.get(`/customers/${id}/statistics`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new customer
   * @param {Object} data - Customer data
   * @returns {Promise<Object>} Created customer
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/customers', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} data - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customers/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update customer loyalty points
   * @param {string} id - Customer ID
   * @param {Object} data - Points operation data
   * @param {string} data.operation - 'add', 'subtract', or 'set'
   * @param {number} data.points - Points amount
   * @returns {Promise<Object>} Updated customer
   */
  updatePoints: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customers/${id}/points`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default customerService;
