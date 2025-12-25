import axios from "axios";

const API_URL = "http://localhost:5000/api/product-batches";

const productBatchService = {
  /**
   * Get all batches with pagination
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error getting batches:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get batches",
      };
    }
  },

  /**
   * Get batches by product ID
   */
  getBatchesByProduct: async (productId, filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/product/${productId}`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting product batches:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get product batches",
      };
    }
  },

  /**
   * Get batch by ID
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting batch:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get batch",
      };
    }
  },

  /**
   * Create new batch
   */
  create: async (batchData) => {
    try {
      const response = await axios.post(API_URL, batchData);
      return response.data;
    } catch (error) {
      console.error("Error creating batch:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create batch",
      };
    }
  },

  /**
   * Update batch
   */
  update: async (id, batchData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, batchData);
      return response.data;
    } catch (error) {
      console.error("Error updating batch:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update batch",
      };
    }
  },

  /**
   * Adjust batch quantity (add or subtract)
   * @param {string} id - Batch ID
   * @param {number} delta - Amount to add (positive) or subtract (negative)
   */
  adjustQuantity: async (id, delta) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/adjust`, { delta });
      return response.data;
    } catch (error) {
      console.error("Error adjusting batch quantity:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to adjust batch quantity",
      };
    }
  },

  /**
   * Consume batches with FEFO (First Expiry First Out)
   * @param {string} product_id - Product ID
   * @param {number} quantity - Quantity to consume
   * @param {string} note - Optional note
   */
  consumeBatches: async (product_id, quantity, note = "") => {
    try {
      const response = await axios.post(`${API_URL}/consume`, {
        product_id,
        quantity,
        note,
      });
      return response.data;
    } catch (error) {
      console.error("Error consuming batches:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to consume batches",
      };
    }
  },

  /**
   * Delete batch (soft delete)
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting batch:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete batch",
      };
    }
  },
};

export default productBatchService;
