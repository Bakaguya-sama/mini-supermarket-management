/**
 * supplierService.js
 * Service layer để gắn API suppliers từ backend
 * Xử lí tất cả CRUD operations: Create, Read, Update, Delete
 */

import apiClient from './apiClient';

const API_BASE_URL = '/suppliers';

export const supplierService = {
  /**
   * Lấy danh sách suppliers với filter, search, pagination
   * @param {Object} params - { page, limit, is_active, search, sort }
   * @returns {Promise} { success, data, total, page, pages, count }
   */
  getAll: async (params = {}) => {
    try {
      console.log('🏢 Fetching suppliers with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      console.log('✅ Raw supplier response:', response.data);
      
      // Handle both formats: array directly OR object with data property
      let formattedResponse;
      if (Array.isArray(response.data)) {
        formattedResponse = {
          success: true,
          data: response.data,
          count: response.data.length,
          total: response.data.length
        };
      } else if (response.data.success !== undefined) {
        formattedResponse = response.data;
      } else {
        formattedResponse = {
          success: true,
          data: response.data || [],
          count: Array.isArray(response.data) ? response.data.length : 0
        };
      }
      
      console.log('✅ Suppliers fetched successfully:', formattedResponse.data);
      return formattedResponse;
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch suppliers',
        data: []
      };
    }
  },

  /**
   * Lấy chi tiết một supplier by ID
   * @param {string} id - Supplier ID
   * @returns {Promise} { success, data }
   */
  getById: async (id) => {
    try {
      console.log(`🏢 Fetching supplier with ID: ${id}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Raw supplier response:', response.data);
      
      // Handle both formats
      let formattedResponse;
      if (response.data.success !== undefined) {
        formattedResponse = response.data;
      } else if (response.data._id || response.data.id) {
        formattedResponse = {
          success: true,
          data: response.data
        };
      } else {
        formattedResponse = response.data;
      }
      
      console.log('✅ Supplier fetched successfully:', formattedResponse.data);
      return formattedResponse;
    } catch (error) {
      console.error(`❌ Error fetching supplier ${id}:`, error);
      return {
        success: false,
        message: error.message || 'Failed to fetch supplier',
        data: null
      };
    }
  },

  /**
   * Tạo supplier mới
   * @param {Object} supplierData - { name, contact_person_name, email, phone, image_link, ... }
   * @returns {Promise} { success, data, message }
   */
  create: async (supplierData) => {
    try {
      console.log('🏢 Creating new supplier:', supplierData);
      
      const payload = {
        name: supplierData.name,
        contact_person_name: supplierData.contact_person_name || supplierData.contactPerson || '',
        email: supplierData.email,
        phone: supplierData.phone,
        website: supplierData.website || '',
        address: supplierData.address || '',
        tax_id: supplierData.tax_id || supplierData.taxId || '',
        note: supplierData.note || '',
        is_active: supplierData.is_active !== undefined ? supplierData.is_active : true,
        image_link: supplierData.image_link || null
      };

      const response = await apiClient.post(API_BASE_URL, payload);
      
      console.log('✅ Supplier created response - success:', response?.success);
      
      // Ensure response has proper format
      const formattedResponse = {
        success: response?.success ?? true,
        message: response?.message || 'Supplier created successfully',
        data: response?.data || response
      };
      
      return formattedResponse;
    } catch (error) {
      console.error('❌ Error creating supplier:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to create supplier',
        data: null
      };
    }
  },

  /**
   * Cập nhật supplier
   * @param {string} id - Supplier ID
   * @param {Object} supplierData - Updated supplier data
   * @returns {Promise} { success, data, message }
   */
  update: async (id, supplierData) => {
    try {
      console.log(`🏢 Updating supplier ${id}:`, supplierData);
      
      const payload = {
        name: supplierData.name,
        contact_person_name: supplierData.contact_person_name || supplierData.contactPerson || '',
        email: supplierData.email,
        phone: supplierData.phone,
        website: supplierData.website || '',
        address: supplierData.address || '',
        tax_id: supplierData.tax_id || supplierData.taxId || '',
        note: supplierData.note || '',
        is_active: supplierData.is_active !== undefined ? supplierData.is_active : true,
        image_link: supplierData.image_link || null
      };

      const response = await apiClient.put(`${API_BASE_URL}/${id}`, payload);
      
      console.log('✅ Supplier updated response - success:', response?.success);
      
      // Ensure response has proper format
      const formattedResponse = {
        success: response?.success ?? true,
        message: response?.message || 'Supplier updated successfully',
        data: response?.data || response
      };
      
      return formattedResponse;
    } catch (error) {
      console.error(`❌ Error updating supplier ${id}:`, error.message);
      return {
        success: false,
        message: error.message || 'Failed to update supplier',
        data: null
      };
    }
  },

  /**
   * Xóa supplier (soft delete)
   * @param {string} id - Supplier ID
   * @returns {Promise} { success, message }
   */
  delete: async (id) => {
    try {
      console.log(`🏢 Deleting supplier ${id}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Supplier deleted response - success:', response?.success);
      
      // Ensure response has success property
      let formattedResponse = {
        success: response?.success ?? true,
        message: response?.message || 'Supplier deleted successfully',
        data: response?.data || response
      };
      
      return formattedResponse;
    } catch (error) {
      console.error(`❌ Error deleting supplier ${id}:`, error.message);
      return {
        success: false,
        message: error.message || 'Failed to delete supplier'
      };
    }
  },

  /**
   * Lấy danh sách suppliers đang hoạt động
   * @returns {Promise} { success, data, count }
   */
  getActiveSuppliers: async () => {
    try {
      console.log('🏢 Fetching active suppliers');
      
      const response = await apiClient.get(`${API_BASE_URL}/active`);
      
      console.log('✅ Active suppliers fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active suppliers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch active suppliers',
        data: []
      };
    }
  },

  /**
   * Lấy thống kê suppliers
   * @returns {Promise} { success, data }
   */
  getStats: async () => {
    try {
      console.log('🏢 Fetching supplier statistics');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats`);
      
      console.log('✅ Supplier stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching supplier stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch supplier statistics',
        data: {}
      };
    }
  }
};

export default supplierService;
