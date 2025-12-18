// client/src/services/promotionService.js
import apiClient from './apiClient';

/**
 * Service for managing promotions
 */
const promotionService = {
  /**
   * Get all active promotions
   */
  getAllPromotions: async (status = 'active') => {
    try {
      const response = await apiClient.get('/promotions', {
        params: { status }
      });
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('❌ Error getting promotions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get promotions',
        data: []
      };
    }
  },

  /**
   * Get applicable promotions for current cart subtotal
   */
  getApplicablePromotions: async (subtotal) => {
    try {
      console.log(`🎁 Fetching promotions for subtotal: $${subtotal}`);
      const response = await apiClient.get('/promotions/applicable', {
        params: { subtotal }
      });
      
      console.log('📦 Promotions response:', response);
      
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('❌ Error getting applicable promotions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get applicable promotions',
        data: []
      };
    }
  },

  /**
   * Validate promo code
   */
  validatePromoCode: async (code, subtotal) => {
    try {
      const response = await apiClient.post('/promotions/validate', {
        code,
        subtotal
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid promo code',
        data: null
      };
    }
  },

  /**
   * Get promotion by ID
   */
  getPromotionById: async (id) => {
    try {
      const response = await apiClient.get(`/promotions/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Error getting promotion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get promotion',
        data: null
      };
    }
  }
};

export default promotionService;
