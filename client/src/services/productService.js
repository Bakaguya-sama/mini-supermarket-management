/**
 * productService.js
 * Service layer để gắn API products từ backend
 * Xử lí tất cả CRUD operations: Create, Read, Update, Delete
 */

import apiClient from './apiClient';

const API_BASE_URL = '/products';

export const productService = {
  /**
   * Lấy danh sách sản phẩm với filter, search, pagination
   * @param {Object} params - { page, limit, category, status, search, minPrice, maxPrice, sort }
   * @returns {Promise} { success, data, total, page, pages, count }
   */
  getAll: async (params = {}) => {
    try {
      console.log('📦 Fetching products with params:', params);
      
      const response = await apiClient.get(API_BASE_URL, { params });
      
      console.log('✅ Products fetched successfully:', response.data);
      // API đã trả về { success, data, ... } - return trực tiếp
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch products',
        data: []
      };
    }
  },

  /**
   * Lấy chi tiết một sản phẩm by ID
   * @param {string} id - Product ID
   * @returns {Promise} { success, data }
   */
  getById: async (id) => {
    try {
      console.log(`📦 Fetching product with ID: ${id}`);
      
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Product fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo sản phẩm mới
   * @param {Object} productData - { name, description, unit, price, category, supplier_id, image_link, ... }
   * @returns {Promise} { success, data, message }
   */
  create: async (productData) => {
    try {
      console.log('📦 Creating new product:', productData);
      
      // Chuẩn bị dữ liệu theo đúng format backend
      const payload = {
        name: productData.name,
        description: productData.description,
        unit: productData.unit,
        price: parseFloat(productData.price),
        current_stock: parseInt(productData.currentStock) || 0,
        minimum_stock_level: parseInt(productData.minimumStockLevel) || 10,
        maximum_stock_level: parseInt(productData.maximumStockLevel) || 1000,
        category: productData.category,
        supplier_id: productData.supplier_id,
        status: 'active',
        storage_location: productData.storageLocation || '',
        image_link: productData.image_link || null
      };

      const response = await apiClient.post(API_BASE_URL, payload);
      
      console.log('✅ Product created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  },

  /**
   * Cập nhật sản phẩm
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} { success, data, message }
   */
  update: async (id, productData) => {
    try {
      console.log(`📦 Updating product ${id}:`, productData);
      
      const payload = {
        name: productData.name,
        description: productData.description,
        unit: productData.unit,
        price: parseFloat(productData.price),
        current_stock: parseInt(productData.currentStock) || 0,
        minimum_stock_level: parseInt(productData.minimumStockLevel) || 10,
        maximum_stock_level: parseInt(productData.maximumStockLevel) || 1000,
        category: productData.category,
        supplier_id: productData.supplier_id,
        status: productData.status || 'active',
        storage_location: productData.storageLocation || '',
        image_link: productData.image_link || null
      };

      const response = await apiClient.put(`${API_BASE_URL}/${id}`, payload);
      
      console.log('✅ Product updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa sản phẩm (soft delete)
   * @param {string} id - Product ID
   * @returns {Promise} { success, message }
   */
  delete: async (id) => {
    try {
      console.log(`📦 Deleting product ${id}`);
      
      const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
      
      console.log('✅ Product deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy sản phẩm có tồn kho thấp
   * @returns {Promise} { success, data, count }
   */
  getLowStockProducts: async () => {
    try {
      console.log('📦 Fetching low stock products');
      
      const response = await apiClient.get(`${API_BASE_URL}/low-stock`);
      
      console.log('✅ Low stock products fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching low stock products:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê sản phẩm
   * @returns {Promise} { success, data }
   */
  getStats: async () => {
    try {
      console.log('📦 Fetching product statistics');
      
      const response = await apiClient.get(`${API_BASE_URL}/stats`);
      
      console.log('✅ Product stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching product stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch stats',
        data: { totalProducts: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 }
      };
    }
  },

  /**
   * Lấy sản phẩm theo category
   * @param {string} category - Category name
   * @param {Object} params - { page, limit }
   * @returns {Promise} { success, data, total, page, pages }
   */
  getByCategory: async (category, params = {}) => {
    try {
      console.log(`📦 Fetching products by category: ${category}`);
      
      const response = await apiClient.get(
        `${API_BASE_URL}/category/${category}`,
        { params }
      );
      
      console.log('✅ Category products fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching products by category ${category}:`, error);
      throw error;
    }
  }
};

export default productService;
