// services/productShelfService.js
import apiClient from "./apiClient";

/**
 * Product Shelf Service
 * Handles all API calls related to product-shelf mappings
 */

/**
 * Get all product-shelf mappings with filters and pagination
 * @param {Object} params - Query parameters (page, limit, product_id, shelf_id, etc.)
 * @returns {Promise<Object>} Response with product-shelf mappings data
 */
export const getAllProductShelves = async (params = {}) => {
  try {
    const response = await apiClient.get("/product-shelves", { params });
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      count: response.count || 0,
      message: "Product-shelf mappings fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching product-shelf mappings:", error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      pages: 1,
      count: 0,
      message:
        error.response?.data?.message ||
        "Failed to fetch product-shelf mappings",
    };
  }
};

/**
 * Get product-shelf statistics
 * @returns {Promise<Object>} Response with statistics data
 */
export const getProductShelfStats = async () => {
  try {
    const response = await apiClient.get("/product-shelves/stats");
    return {
      success: true,
      data: response.data || {},
      message: "Statistics fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching product-shelf stats:", error);
    return {
      success: false,
      data: {},
      message: error.response?.data?.message || "Failed to fetch statistics",
    };
  }
};

/**
 * Get product-shelf mapping by ID
 * @param {string} productShelfId - The product-shelf mapping ID
 * @returns {Promise<Object>} Response with product-shelf mapping details
 */
export const getProductShelfById = async (productShelfId) => {
  try {
    const response = await apiClient.get(`/product-shelves/${productShelfId}`);
    return {
      success: true,
      data: response.data || null,
      message: "Product-shelf mapping details fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching product-shelf mapping by ID:", error);
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message ||
        "Failed to fetch product-shelf mapping details",
    };
  }
};

/**
 * Get all shelves containing a specific product
 * @param {string} productId - The product ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with shelves data
 */
export const getShelvesByProduct = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(
      `/product-shelves/product/${productId}/shelves`,
      { params }
    );
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      message: "Product shelves fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching shelves by product:", error);
    return {
      success: false,
      data: [],
      total: 0,
      message:
        error.response?.data?.message || "Failed to fetch product shelves",
    };
  }
};

/**
 * Get all products on a specific shelf
 * @param {string} shelfId - The shelf ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with products data
 */
export const getProductsByShelf = async (shelfId, params = {}) => {
  try {
    const response = await apiClient.get(
      `/product-shelves/shelf/${shelfId}/products`,
      { params }
    );
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      message: "Shelf products fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching products by shelf:", error);
    return {
      success: false,
      data: [],
      total: 0,
      message:
        error.response?.data?.message || "Failed to fetch shelf products",
    };
  }
};

/**
 * Create a new product-shelf mapping (assign product to shelf)
 * @param {Object} productShelfData - The product-shelf mapping data
 * @returns {Promise<Object>} Response with created mapping
 */
export const createProductShelf = async (productShelfData) => {
  try {
    const response = await apiClient.post("/product-shelves", productShelfData);
    return {
      success: true,
      data: response.data || null,
      message: response.message || "Product assigned to shelf successfully",
    };
  } catch (error) {
    console.error("Error creating product-shelf mapping:", error);
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message || "Failed to assign product to shelf",
    };
  }
};

/**
 * Update product-shelf mapping
 * @param {string} productShelfId - The product-shelf mapping ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Response with updated mapping
 */
export const updateProductShelf = async (productShelfId, updateData) => {
  try {
    const response = await apiClient.put(
      `/product-shelves/${productShelfId}`,
      updateData
    );
    return {
      success: true,
      data: response.data || null,
      message: response.message || "Product-shelf mapping updated successfully",
    };
  } catch (error) {
    console.error("Error updating product-shelf mapping:", error);
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message ||
        "Failed to update product-shelf mapping",
    };
  }
};

/**
 * Move product to another shelf
 * @param {string} productShelfId - The product-shelf mapping ID
 * @param {Object} moveData - The move data (new_shelf_id, quantity)
 * @returns {Promise<Object>} Response with move result
 */
export const moveProductToShelf = async (productShelfId, moveData) => {
  try {
    const response = await apiClient.put(
      `/product-shelves/${productShelfId}/move`,
      moveData
    );
    return {
      success: true,
      data: response.data || null,
      message: response.message || "Product moved to new shelf successfully",
    };
  } catch (error) {
    console.error("Error moving product to shelf:", error);
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message || "Failed to move product to shelf",
    };
  }
};

/**
 * Delete product-shelf mapping (soft delete)
 * @param {string} productShelfId - The product-shelf mapping ID
 * @returns {Promise<Object>} Response with deletion result
 */
export const deleteProductShelf = async (productShelfId) => {
  try {
    const response = await apiClient.delete(
      `/product-shelves/${productShelfId}`
    );
    return {
      success: true,
      message: response.message || "Product removed from shelf successfully",
    };
  } catch (error) {
    console.error("Error deleting product-shelf mapping:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to remove product from shelf",
    };
  }
};

/**
 * Bulk assign multiple products to a shelf
 * @param {Object} bulkAssignData - The bulk assign data (shelf_id, products[])
 * @returns {Promise<Object>} Response with bulk assign result
 */
export const bulkAssignToShelf = async (bulkAssignData) => {
  try {
    console.log("📡 SERVICE: Calling API POST /product-shelves/bulk/assign");
    console.log("📡 SERVICE: Request data:", bulkAssignData);
    
    // apiClient already returns response.data (see apiClient.js interceptor)
    // So we get the data object directly, not response.data.data
    const data = await apiClient.post(
      "/product-shelves/bulk/assign",
      bulkAssignData
    );
    
    console.log("📡 SERVICE: API returned data:", data);
    
    const result = {
      success: data?.success ?? true,
      data: data?.data || data,  // data.data if exists, otherwise just data
      message: data?.message || "Products assigned to shelf",
    };
    
    console.log("📡 SERVICE: Returning:", result);
    return result;
  } catch (error) {
    console.error("📡 SERVICE ERROR:", error.message);
    console.error("📡 SERVICE ERROR Details:", error);
    
    const result = {
      success: false,
      data: null,
      message: error?.message || "Failed to assign products to shelf",
    };
    
    console.log("📡 SERVICE: Returning error:", result);
    return result;
  }
};

/**
 * Get products on shelves for damaged product recording
 * @param {Object} params - Query parameters (page, limit, supplier_id, shelf_id, section, search)
 * @returns {Promise<Object>} Response with products data for damaged recording
 */
export const getProductsForDamagedRecord = async (params = {}) => {
  try {
    const response = await apiClient.get("/product-shelves/for-damaged-record", { params });
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      count: response.count || 0,
      message: "Products for damaged record fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching products for damaged record:", error);
    return {
      success: false,
      data: [],
      total: 0,
      page: 1,
      pages: 1,
      count: 0,
      message:
        error.response?.data?.message ||
        "Failed to fetch products for damaged record",
    };
  }
};

export const productShelfService = {
  getAllProductShelves,
  getProductShelfStats,
  getProductShelfById,
  getShelvesByProduct,
  getProductsByShelf,
  createProductShelf,
  updateProductShelf,
  moveProductToShelf,
  deleteProductShelf,
  bulkAssignToShelf,
  getProductsForDamagedRecord,
};

export default productShelfService;
