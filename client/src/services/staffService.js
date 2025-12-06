import apiClient from './apiClient';

/**
 * Staff Management Service
 * Handles all staff-related API calls
 */

const staffService = {
  /**
   * Get paginated list of staff
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search by name, email, phone
   * @param {string} params.position - Filter by position
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.position) queryParams.append('position', params.position);

      const response = await apiClient.get(`/staff?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get staff by ID
   * @param {string} id - Staff ID
   * @returns {Promise<Object>} Staff data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/staff/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get staff by position
   * @param {string} position - Staff position
   * @returns {Promise<Array>} List of staff
   */
  getByPosition: async (position) => {
    try {
      const response = await apiClient.get(`/staff/position/${position}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get staff statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/staff/statistics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new staff
   * @param {Object} data - Staff data
   * @returns {Promise<Object>} Created staff
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/staff', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update staff
   * @param {string} id - Staff ID
   * @param {Object} data - Updated staff data
   * @returns {Promise<Object>} Updated staff
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/staff/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete staff (soft delete)
   * @param {string} id - Staff ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/staff/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default staffService;
