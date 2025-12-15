// services/sectionService.js
import apiClient from "./apiClient";

const sectionService = {
  // Get all sections with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/sections", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sections:", error);
      throw error;
    }
  },

  // Get a single section by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/sections/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching section:", error);
      throw error;
    }
  },

  // Create a new section
  create: async (sectionData) => {
    try {
      const response = await apiClient.post("/sections", sectionData);
      return response.data;
    } catch (error) {
      console.error("Error creating section:", error);
      throw error;
    }
  },

  // Update a section
  update: async (id, sectionData) => {
    try {
      const response = await apiClient.put(`/sections/${id}`, sectionData);
      return response.data;
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  },

  // Delete a section (soft delete)
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/sections/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  },

  // Get shelves in a section
  getShelves: async (id) => {
    try {
      const response = await apiClient.get(`/sections/${id}/shelves`);
      return response.data;
    } catch (error) {
      console.error("Error fetching section shelves:", error);
      throw error;
    }
  },
};

export default sectionService;
