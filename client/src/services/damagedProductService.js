// services/damagedProductService.js
import apiClient from './apiClient';

/**
 * Damaged Product Service
 * Handles all API calls related to damaged products
 */

/**
 * Get all damaged products with filters and pagination
 * @param {Object} params - Query parameters (page, limit, status, search, etc.)
 * @returns {Promise<Object>} Response with damaged products data
 */
export const getAllDamagedProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/damaged-products', { params });
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      count: response.count || 0,
      message: 'Damaged products fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching damaged products:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      pages: 1,
      count: 0,
      message: error.response?.data?.message || 'Failed to fetch damaged products'
    };
  }
};

/**
 * Get damaged product statistics
 * @returns {Promise<Object>} Response with statistics data
 */
export const getDamagedProductStats = async () => {
  try {
    const response = await apiClient.get('/damaged-products/stats');
    return {
      success: true,
      data: response.data || {},
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching damaged product stats:', error);
    return {
      success: false,
      data: {},
      message: error.response?.data?.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Get damaged product by ID
 * @param {string} damagedProductId - The damaged product ID
 * @returns {Promise<Object>} Response with damaged product details
 */
export const getDamagedProductById = async (damagedProductId) => {
  try {
    const response = await apiClient.get(`/damaged-products/${damagedProductId}`);
    return {
      success: true,
      data: response.data || null,
      message: 'Damaged product details fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching damaged product by ID:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch damaged product details'
    };
  }
};

/**
 * Get all damaged records for a specific product
 * @param {string} productId - The product ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with damaged records for the product
 */
export const getDamagedProductsByProductId = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(`/damaged-products/product/${productId}`, { params });
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      message: 'Product damaged history fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching damaged products by product ID:', error);
    return {
      success: false,
      data: [],
      total: 0,
      message: error.response?.data?.message || 'Failed to fetch product damaged history'
    };
  }
};

/**
 * Create a new damaged product record
 * @param {Object} damagedProductData - The damaged product data
 * @returns {Promise<Object>} Response with created damaged product
 */
export const createDamagedProduct = async (damagedProductData) => {
  try {
    const response = await apiClient.post('/damaged-products', damagedProductData);
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Damaged product record created successfully'
    };
  } catch (error) {
    console.error('Error creating damaged product:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to create damaged product record'
    };
  }
};

/**
 * Update damaged product record
 * @param {string} damagedProductId - The damaged product ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Response with updated damaged product
 */
export const updateDamagedProduct = async (damagedProductId, updateData) => {
  try {
    const response = await apiClient.put(`/damaged-products/${damagedProductId}`, updateData);
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Damaged product record updated successfully'
    };
  } catch (error) {
    console.error('Error updating damaged product:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to update damaged product record'
    };
  }
};

/**
 * Adjust inventory for damaged product
 * @param {string} damagedProductId - The damaged product ID
 * @param {Object} adjustmentData - The adjustment data
 * @returns {Promise<Object>} Response with adjustment result
 */
export const adjustInventoryForDamaged = async (damagedProductId, adjustmentData = {}) => {
  try {
    const response = await apiClient.put(`/damaged-products/${damagedProductId}/adjust-inventory`, adjustmentData);
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Inventory adjusted successfully'
    };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to adjust inventory'
    };
  }
};

/**
 * Delete damaged product record (soft delete)
 * @param {string} damagedProductId - The damaged product ID
 * @returns {Promise<Object>} Response with deletion result
 */
export const deleteDamagedProduct = async (damagedProductId) => {
  try {
    const response = await apiClient.delete(`/damaged-products/${damagedProductId}`);
    return {
      success: true,
      message: response.message || 'Damaged product record deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting damaged product:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete damaged product record'
    };
  }
};

/**
 * Get shelf locations for damaged product
 * @param {string} damagedProductId - The damaged product ID
 * @returns {Promise<Object>} Response with shelf locations
 */
export const getDamagedProductShelves = async (damagedProductId) => {
  try {
    const response = await apiClient.get(`/damaged-products/${damagedProductId}/shelves`);
    return {
      success: true,
      data: response.data || [],
      message: 'Shelf locations fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching damaged product shelves:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch shelf locations'
    };
  }
};

/**
 * Bulk update status for multiple damaged products
 * @param {Object} bulkUpdateData - The bulk update data
 * @returns {Promise<Object>} Response with bulk update result
 */
export const bulkUpdateStatus = async (bulkUpdateData) => {
  try {
    const response = await apiClient.put('/damaged-products/bulk/update-status', bulkUpdateData);
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Bulk status update completed successfully'
    };
  } catch (error) {
    console.error('Error bulk updating status:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to bulk update status'
    };
  }
};

export const damagedProductService = {
  getAllDamagedProducts,
  getDamagedProductStats,
  getDamagedProductById,
  getDamagedProductsByProductId,
  createDamagedProduct,
  updateDamagedProduct,
  adjustInventoryForDamaged,
  deleteDamagedProduct,
  getDamagedProductShelves,
  bulkUpdateStatus
};

export default damagedProductService;
