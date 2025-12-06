import apiClient from './apiClient';

/**
 * Supplier Management Service
 * Handles all supplier-related API calls
 */

const supplierService = {
  /**
   * Get paginated list of suppliers
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {boolean} params.active - Filter active/inactive
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.active !== undefined) queryParams.append('active', params.active);

      const response = await apiClient.get(`/suppliers?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get supplier by ID
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>} Supplier data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active suppliers only
   * @returns {Promise<Array>} List of active suppliers
   */
  getActive: async () => {
    try {
      const response = await apiClient.get('/suppliers/active');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get supplier statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/suppliers/statistics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new supplier
   * @param {Object} data - Supplier data
   * @returns {Promise<Object>} Created supplier
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/suppliers', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update supplier
   * @param {string} id - Supplier ID
   * @param {Object} data - Updated supplier data
   * @returns {Promise<Object>} Updated supplier
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete supplier (soft delete)
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/suppliers/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default supplierService;
