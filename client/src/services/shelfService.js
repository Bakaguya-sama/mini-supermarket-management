// services/shelfService.js
import apiClient from "./apiClient";

const shelfService = {
  // Get all shelves with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/shelves", { params });
      return response; // apiClient returns response.data already
    } catch (error) {
      console.error("Error fetching shelves:", error);
      throw error;
    }
  },

  // Get a single shelf by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/shelves/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching shelf:", error);
      throw error;
    }
  },

  // Create a new shelf
  create: async (shelfData) => {
    try {
      const response = await apiClient.post("/shelves", shelfData);
      return response;
    } catch (error) {
      console.error("Error creating shelf:", error);
      throw error;
    }
  },

  // Update a shelf
  update: async (id, shelfData) => {
    try {
      const response = await apiClient.put(`/shelves/${id}`, shelfData);
      return response;
    } catch (error) {
      console.error("Error updating shelf:", error);
      throw error;
    }
  },

  // Delete a shelf (soft delete)
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/shelves/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting shelf:", error);
      throw error;
    }
  },

  // Get shelf statistics
  getStats: async () => {
    try {
      const response = await apiClient.get("/shelves/stats");
      return response;
    } catch (error) {
      console.error("Error fetching shelf stats:", error);
      throw error;
    }
  },
};

export default shelfService;
