// client/src/services/feedbackService.js
import apiClient from './apiClient';

const API_BASE_URL = '/feedbacks';

export const feedbackService = {
  /**
   * Create new feedback
   * @param {Object} feedbackData - { category, subject, detail, customer_id, rating, sentiment }
   * @returns {Promise} { success, data, message, bonusPoints }
   */
  create: async (feedbackData) => {
    try {
      console.log('💬 Creating feedback:', feedbackData);
      
      const response = await apiClient.post(API_BASE_URL, feedbackData);
      
      console.log('✅ Feedback created successfully:', response);
      
      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || 'Feedback submitted successfully',
        bonusPoints: response.bonusPoints || 0
      };
    } catch (error) {
      console.error('❌ Error creating feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to submit feedback',
        data: null,
        bonusPoints: 0
      };
    }
  },

  /**
   * Get all feedbacks with filters
   * @param {Object} params - { page, limit, category, status, customer_id, sort }
   * @returns {Promise} { success, data, total, page, pages, count }
   */
  getAll: async (params = {}) => {
    try {
      console.log('💬 Fetching feedbacks with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      console.log('✅ Feedbacks fetched successfully:', response);
      
      return {
        success: response.success !== false,
        data: response.data || response,
        count: response.count || (response.data ? response.data.length : 0),
        total: response.total || 0,
        page: response.page || 1,
        pages: response.pages || 1,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch feedbacks',
        data: [],
        count: 0,
        total: 0
      };
    }
  },

  /**
   * Get customer's own feedbacks
   * @param {String} customerId - Customer ID
   * @returns {Promise} { success, data, count }
   */
  getCustomerFeedbacks: async (customerId) => {
    try {
      console.log(`💬 Fetching feedbacks for customer: ${customerId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/customer/${customerId}`);
      
      console.log('✅ Customer feedbacks fetched:', response);
      
      return {
        success: response.success !== false,
        data: response.data || [],
        count: response.count || (response.data ? response.data.length : 0),
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching customer feedbacks:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customer feedbacks',
        data: [],
        count: 0
      };
    }
  },

  /**
   * Get feedback by ID
   * @param {String} id - Feedback ID
   * @returns {Promise} { success, data }
   */
  getById: async (id) => {
    try {
      console.log(`💬 Fetching feedback: ${id}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Feedback fetched:', response);
      
      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch feedback',
        data: null
      };
    }
  },

  /**
   * Update feedback status
   * @param {String} id - Feedback ID
   * @param {Object} updateData - { status, assigned_to_staff_id }
   * @returns {Promise} { success, data, message }
   */
  updateStatus: async (id, updateData) => {
    try {
      console.log(`💬 Updating feedback ${id}:`, updateData);
      
      const response = await apiClient.put(`${API_BASE_URL}/${id}`, updateData);
      
      console.log('✅ Feedback updated:', response);
      
      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || 'Feedback updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update feedback',
        data: null
      };
    }
  },

  /**
   * Delete feedback (soft delete)
   * @param {String} id - Feedback ID
   * @returns {Promise} { success, message }
   */
  delete: async (id) => {
    try {
      console.log(`💬 Deleting feedback: ${id}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Feedback deleted:', response);
      
      return {
        success: response.success !== false,
        message: response.message || 'Feedback deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete feedback'
      };
    }
  },

  /**
   * Get feedback statistics
   * @returns {Promise} { success, data }
   */
  getStats: async () => {
    try {
      console.log('💬 Fetching feedback statistics');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats/summary`);
      
      console.log('✅ Feedback stats fetched:', response);
      
      return {
        success: response.success !== false,
        data: response.data || {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          complaints: 0,
          suggestions: 0,
          praises: 0
        },
        message: response.message
      };
    } catch (error) {
      console.error('❌ Error fetching feedback stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch feedback statistics',
        data: {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          complaints: 0,
          suggestions: 0,
          praises: 0
        }
      };
    }
  }
};

export default feedbackService;
