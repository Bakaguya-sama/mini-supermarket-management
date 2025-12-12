/**
 * customerService.js
 * Service layer để gắn API customers từ backend
 * Xử lí tất cả CRUD operations: Create, Read, Update, Delete
 * 
 * Patterns applied from: productService.js, staffService.js
 */

import apiClient from './apiClient';

const API_BASE_URL = '/customers';

export const customerService = {
  /**
   * Lấy danh sách customers với filter, search, pagination
   * @param {Object} params - { page, limit, membership_type, minSpent, maxSpent, sort }
   * @returns {Promise} { success, data, total, page, pages, count }
   */
  getAll: async (params = {}) => {
    try {
      console.log('🛒 Fetching customers with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      // apiClient response interceptor already returns response.data
      // so response is the actual API response object { success, data, count, total, page, pages }
      console.log('✅ Response object:', response);
      console.log('✅ Customers fetched successfully:', response.data || response);
      
      // If response has data property, it's the API response, otherwise response IS the data
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
      console.error('❌ Error fetching customers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customers',
        data: [],
        count: 0,
        total: 0
      };
    }
  },

  /**
   * Lấy chi tiết một customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise} { success, data }
   */
  getById: async (id) => {
    try {
      console.log(`🛒 Fetching customer with ID: ${id}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Customer fetched successfully:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error(`❌ Error fetching customer ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customer',
        data: null
      };
    }
  },

  /**
   * Tạo customer mới với account
   * @param {Object} customerData - { username, email, full_name, phone, address, membership_type, notes } OR { account_id, membership_type, notes }
   * @returns {Promise} { success, data, message }
   */
  create: async (customerData) => {
    try {
      console.log('🛒 Creating new customer:', customerData);
      
      const payload = {
        // If account_id provided, use it; otherwise send account creation fields
        ...(customerData.account_id ? 
          { account_id: customerData.account_id } : 
          {
            username: customerData.username,
            email: customerData.email,
            full_name: customerData.full_name,
            phone: customerData.phone || '',
            address: customerData.address || ''
          }
        ),
        membership_type: customerData.membership_type || 'Standard',
        notes: customerData.notes || ''
      };

      console.log('📤 Sending payload:', payload);
      
      const response = await apiClient.post(API_BASE_URL, payload);
      
      console.log('✅ Customer created successfully:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Customer created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create customer',
        data: null
      };
    }
  },

  /**
   * Cập nhật customer
   * @param {string} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise} { success, data, message }
   */
  update: async (id, customerData) => {
    try {
      console.log(`🛒 Updating customer ${id}:`, customerData);
      
      const payload = {
        membership_type: customerData.membership_type,
        notes: customerData.notes || ''
      };

      const response = await apiClient.put(`${API_BASE_URL}/${id}`, payload);
      
      console.log('✅ Customer updated successfully:', response);
      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || 'Customer updated successfully'
      };
    } catch (error) {
      console.error(`❌ Error updating customer ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update customer',
        data: null
      };
    }
  },

  /**
   * Xóa customer (soft delete)
   * @param {string} id - Customer ID
   * @returns {Promise} { success, message }
   */
  delete: async (id) => {
    try {
      console.log(`🛒 Deleting customer ${id}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Customer deleted successfully:', response);
      return {
        success: response.success !== false,
        message: response.message || 'Customer deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting customer ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete customer',
      };
    }
  },

  /**
   * Lấy thống kê customers
   * @returns {Promise} { success, data }
   */
  getStats: async () => {
    try {
      console.log('🛒 Fetching customer statistics');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats`);
      
      console.log('✅ Customer stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customer stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customer statistics',
        data: {}
      };
    }
  },

  /**
   * Lấy tất cả đơn hàng của một customer
   * @param {string} customerId - Customer ID
   * @returns {Promise} { success, data }
   */
  getCustomerOrders: async (customerId) => {
    try {
      console.log(`🛒 Fetching orders for customer ${customerId}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${customerId}/orders`);
      
      console.log('✅ Customer orders fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching orders for customer ${customerId}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch customer orders',
        data: []
      };
    }
  },

  /**
   * Cập nhật loyalty points
   * @param {string} customerId - Customer ID
   * @param {number} points - Points to add/subtract
   * @returns {Promise} { success, data, message }
   */
  updatePoints: async (customerId, points) => {
    try {
      console.log(`🛒 Updating points for customer ${customerId}: ${points}`);
      
      const response = await apiClient.patch(`${API_BASE_URL}/${customerId}/points`, { points });
      
      console.log('✅ Customer points updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating customer points:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update customer points',
        data: null
      };
    }
  },

  /**
   * Cập nhật total spent
   * @param {string} customerId - Customer ID
   * @param {number} amount - Amount to add
   * @returns {Promise} { success, data, message }
   */
  updateTotalSpent: async (customerId, amount) => {
    try {
      console.log(`🛒 Updating total spent for customer ${customerId}: ${amount}`);
      
      const response = await apiClient.patch(`${API_BASE_URL}/${customerId}/spent`, { total_spent: amount });
      
      console.log('✅ Customer spending updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating customer spending:`, error);
      return {
        success: false,
        message: error.message || 'Failed to update customer spending',
        data: null
      };
    }
  }
};

export default customerService;
