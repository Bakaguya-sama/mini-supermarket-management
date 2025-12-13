// services/invoiceService.js - Invoice API Service
import apiClient from './apiClient';

/**
 * Invoice Service
 * Handles all API calls related to invoices
 */

/**
 * Get all invoices with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.payment_status - Filter by payment status (unpaid, paid, partial)
 * @param {string} params.search - Search term for invoice number or notes
 * @param {number} params.minAmount - Minimum amount filter
 * @param {number} params.maxAmount - Maximum amount filter
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {string} params.sort - Sort field (default: '-invoice_date')
 * @returns {Promise<Object>} Response with invoices list
 */
export const getAllInvoices = async (params = {}) => {
  try {
    const response = await apiClient.get('/invoices', { params });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
      message: 'Invoices fetched successfully'
    };
  } catch (error) {
    console.error('Get invoices error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch invoices'
    };
  }
};

/**
 * Get invoice statistics
 * @returns {Promise<Object>} Response with statistics
 */
export const getInvoiceStats = async () => {
  try {
    const response = await apiClient.get('/invoices/stats');
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || {},
      message: 'Statistics fetched successfully'
    };
  } catch (error) {
    console.error('Get invoice stats error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Get single invoice by ID with items
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Response with invoice details
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await apiClient.get(`/invoices/${invoiceId}`);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: 'Invoice details fetched successfully'
    };
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch invoice details'
    };
  }
};

/**
 * Get invoices by customer ID
 * @param {string} customerId - Customer ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with customer invoices
 */
export const getInvoicesByCustomer = async (customerId, params = {}) => {
  try {
    const response = await apiClient.get(`/invoices/customer/${customerId}`, { params });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || [],
      customer: response.customer || {},
      total: response.total || 0,
      message: 'Customer invoices fetched successfully'
    };
  } catch (error) {
    console.error('Get customer invoices error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch customer invoices'
    };
  }
};

/**
 * Get unpaid invoices
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with unpaid invoices
 */
export const getUnpaidInvoices = async (params = {}) => {
  try {
    const response = await apiClient.get('/invoices/filter/unpaid', { params });
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || [],
      total: response.total || 0,
      message: 'Unpaid invoices fetched successfully'
    };
  } catch (error) {
    console.error('Get unpaid invoices error:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch unpaid invoices'
    };
  }
};

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @param {string} invoiceData.customer_id - Customer ID
 * @param {string} invoiceData.order_id - Order ID
 * @param {Array} invoiceData.items - Invoice items
 * @param {string} invoiceData.notes - Additional notes
 * @returns {Promise<Object>} Response with created invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await apiClient.post('/invoices', invoiceData);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Invoice created successfully'
    };
  } catch (error) {
    console.error('Create invoice error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to create invoice'
    };
  }
};

/**
 * Update invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.payment_status - Payment status (unpaid, paid, partial)
 * @param {string} updateData.notes - Notes
 * @returns {Promise<Object>} Response with updated invoice
 */
export const updateInvoice = async (invoiceId, updateData) => {
  try {
    const response = await apiClient.put(`/invoices/${invoiceId}`, updateData);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Invoice updated successfully'
    };
  } catch (error) {
    console.error('Update invoice error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to update invoice'
    };
  }
};

/**
 * Mark invoice as paid
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Response with updated invoice
 */
export const markInvoiceAsPaid = async (invoiceId) => {
  try {
    const response = await apiClient.patch(`/invoices/${invoiceId}/mark-paid`);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Invoice marked as paid successfully'
    };
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to mark invoice as paid'
    };
  }
};

/**
 * Delete invoice (soft delete)
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Response with deletion result
 */
export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await apiClient.delete(`/invoices/${invoiceId}`);
    // apiClient interceptor already returns response.data
    return {
      success: true,
      data: response.data || null,
      message: response.message || 'Invoice deleted successfully'
    };
  } catch (error) {
    console.error('Delete invoice error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to delete invoice'
    };
  }
};

// Default export object with all functions
export const invoiceService = {
  getAllInvoices,
  getInvoiceStats,
  getInvoiceById,
  getInvoicesByCustomer,
  getUnpaidInvoices,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice
};

export default invoiceService;
