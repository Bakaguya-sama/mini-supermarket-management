import apiClient from './apiClient';

/**
 * Product Management Service
 * Handles all product-related API calls
 */

const productService = {
  /**
   * Get paginated list of products
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.category - Filter by category
   * @param {string} params.status - Filter by status (available, out_of_stock)
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);

      const response = await apiClient.get(`/products?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} List of products
   */
  getByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/products/category/${category}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get low stock products
   * @returns {Promise<Array>} Low stock products
   */
  getLowStock: async () => {
    try {
      const response = await apiClient.get('/products/stock/low');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/products/statistics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new product
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Created product
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/products', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} data - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/products/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {Object} data - Stock operation data
   * @param {string} data.operation - 'add', 'subtract', or 'set'
   * @param {number} data.quantity - Quantity to add/subtract/set
   * @returns {Promise<Object>} Updated product
   */
  updateStock: async (id, data) => {
    try {
      const response = await apiClient.patch(`/products/${id}/stock`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete product (soft delete)
   * @param {string} id - Product ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default productService;
