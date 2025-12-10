/**
 * staffService.js
 * Service layer để gắn API staff từ backend
 * Xử lí tất cả CRUD operations: Create, Read, Update, Delete
 */

import apiClient from './apiClient';

const API_BASE_URL = '/staff';

export const staffService = {
  /**
   * Lấy danh sách staff với filter, search, pagination
   * @param {Object} params - { page, limit, position, is_active, employment_type, search, sort }
   * @returns {Promise} { success, data, total, page, pages, count }
   */
  getAll: async (params = {}) => {
    try {
      console.log('👔 Fetching staff with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      console.log('✅ Staff fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch staff',
        data: []
      };
    }
  },

  /**
   * Lấy chi tiết một staff by ID
   * @param {string} id - Staff ID
   * @returns {Promise} { success, data }
   */
  getById: async (id) => {
    try {
      console.log(`👔 Fetching staff with ID: ${id}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Staff fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching staff ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo staff mới với account
   * @param {Object} staffData - { username, password, email, full_name, avatar_link, position, ... }
   * @returns {Promise} { success, data, message }
   */
  create: async (staffData) => {
    try {
      console.log('👔 Creating new staff:', staffData);
      
      const payload = {
        username: staffData.username,
        password: staffData.password,
        email: staffData.email,
        full_name: staffData.full_name || '',
        phone: staffData.phone || '',
        address: staffData.address || '',
        date_of_birth: staffData.date_of_birth || '',
        avatar_link: staffData.avatar_link || null,
        position: staffData.position,
        employment_type: staffData.employment_type || '',
        annual_salary: staffData.annual_salary || 0,
        hire_date: staffData.hire_date || new Date(),
        notes: staffData.notes || ''
      };

      const response = await apiClient.post(API_BASE_URL, payload);
      
      console.log('✅ Staff created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      throw error;
    }
  },

  /**
   * Cập nhật staff
   * @param {string} id - Staff ID
   * @param {Object} staffData - Updated staff data
   * @returns {Promise} { success, data, message }
   */
  update: async (id, staffData) => {
    try {
      console.log(`👔 Updating staff ${id}:`, staffData);
      
      const payload = {
        full_name: staffData.full_name,
        phone: staffData.phone,
        address: staffData.address,
        date_of_birth: staffData.date_of_birth,
        avatar_link: staffData.avatar_link || null,
        position: staffData.position,
        employment_type: staffData.employment_type,
        annual_salary: staffData.annual_salary,
        hire_date: staffData.hire_date,
        notes: staffData.notes,
        is_active: staffData.is_active !== undefined ? staffData.is_active : true
      };

      const response = await apiClient.put(`${API_BASE_URL}/${id}`, payload);
      
      console.log('✅ Staff updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating staff ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa staff (soft delete)
   * @param {string} id - Staff ID
   * @returns {Promise} { success, message }
   */
  delete: async (id) => {
    try {
      console.log(`👔 Deleting staff ${id}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Staff deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting staff ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thống kê staff
   * @returns {Promise} { success, data }
   */
  getStats: async () => {
    try {
      console.log('👔 Fetching staff statistics');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats`);
      
      console.log('✅ Staff stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching staff stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch staff statistics',
        data: {}
      };
    }
  }
};

export default staffService;
