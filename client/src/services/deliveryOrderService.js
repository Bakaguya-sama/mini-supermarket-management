// services/deliveryOrderService.js - Delivery Order API Service
import apiClient from './apiClient';

/**
 * Delivery Order Service
 * Handles all API calls related to delivery orders
 */

/**
 * Get all delivery orders with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.staff_id - Filter by staff ID
 * @param {string} params.status - Filter by status (assigned, in_transit, delivered, failed)
 * @param {string} params.search - Search term for tracking number or notes
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {string} params.sort - Sort field (default: '-createdAt')
 * @returns {Promise<Object>} Response with delivery orders list
 */
export const getAllDeliveryOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/delivery-orders', { params });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      message: 'Delivery orders fetched successfully'
    };
  } catch (error) {
    console.error('Get delivery orders error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch delivery orders'
    };
  }
};

/**
 * Get delivery order statistics
 * @returns {Promise<Object>} Response with statistics
 */
export const getDeliveryStats = async () => {
  try {
    const response = await apiClient.get('/delivery-orders/stats');
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || {},
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Get delivery stats error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Get delivery orders by staff member
 * @param {string} staffId - Staff ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} Response with staff delivery orders
 */
export const getDeliveriesByStaff = async (staffId, params = {}) => {
  try {
    const response = await apiClient.get(`/delivery-orders/staff/${staffId}`, { params });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || [],
      staff: response.staff || {},
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      message: 'Staff deliveries fetched successfully'
    };
  } catch (error) {
    console.error('Get staff deliveries error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch staff deliveries'
    };
  }
};

/**
 * Get single delivery order by ID with order items
 * @param {string} deliveryId - Delivery Order ID
 * @returns {Promise<Object>} Response with delivery order details
 */
export const getDeliveryOrderById = async (deliveryId) => {
  try {
    const response = await apiClient.get(`/delivery-orders/${deliveryId}`);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: 'Delivery order details fetched successfully'
    };
  } catch (error) {
    console.error('Get delivery order by ID error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch delivery order details'
    };
  }
};

/**
 * Create new delivery order
 * @param {Object} deliveryData - Delivery order data
 * @param {string} deliveryData.order_id - Order ID
 * @param {string} deliveryData.staff_id - Staff ID
 * @param {string} deliveryData.notes - Additional notes
 * @returns {Promise<Object>} Response with created delivery order
 */
export const createDeliveryOrder = async (deliveryData) => {
  try {
    const response = await apiClient.post('/delivery-orders', deliveryData);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Delivery order created successfully'
    };
  } catch (error) {
    console.error('Create delivery order error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to create delivery order'
    };
  }
};

/**
 * Update delivery order status
 * @param {string} deliveryId - Delivery Order ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.status - Status (assigned, in_transit, delivered, failed)
 * @param {string} updateData.delivery_date - Delivery date
 * @param {string} updateData.notes - Notes
 * @returns {Promise<Object>} Response with updated delivery order
 */
export const updateDeliveryOrder = async (deliveryId, updateData) => {
  try {
    const response = await apiClient.put(`/delivery-orders/${deliveryId}`, updateData);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Delivery order updated successfully'
    };
  } catch (error) {
    console.error('Update delivery order error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to update delivery order'
    };
  }
};

/**
 * Reassign delivery to another staff
 * @param {string} deliveryId - Delivery Order ID
 * @param {string} newStaffId - New staff ID
 * @returns {Promise<Object>} Response with reassigned delivery order
 */
export const reassignDelivery = async (deliveryId, newStaffId) => {
  try {
    const response = await apiClient.patch(`/delivery-orders/${deliveryId}/reassign`, {
      new_staff_id: newStaffId
    });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Delivery reassigned successfully'
    };
  } catch (error) {
    console.error('Reassign delivery error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to reassign delivery'
    };
  }
};

/**
 * Delete delivery order (soft delete)
 * @param {string} deliveryId - Delivery Order ID
 * @returns {Promise<Object>} Response with deletion result
 */
export const deleteDeliveryOrder = async (deliveryId) => {
  try {
    const response = await apiClient.delete(`/delivery-orders/${deliveryId}`);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Delivery order deleted successfully'
    };
  } catch (error) {
    console.error('Delete delivery order error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to delete delivery order'
    };
  }
};

// Default export object with all functions
export const deliveryOrderService = {
  getAllDeliveryOrders,
  getDeliveryStats,
  getDeliveriesByStaff,
  getDeliveryOrderById,
  createDeliveryOrder,
  updateDeliveryOrder,
  reassignDelivery,
  deleteDeliveryOrder
};

export default deliveryOrderService;
