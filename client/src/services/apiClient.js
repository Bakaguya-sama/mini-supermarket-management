/**
 * apiClient.js
 * Centralized Axios instance cho tất cả API calls
 * Xử lí authentication, error handling, logging
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API Client initialized with URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor - Thêm token và logging
 */
apiClient.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle responses, errors, logging
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      console.error(`❌ Error Response [${error.response.status}]:`, {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }

      // Return error response data
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response received:', {
        url: error.config?.url,
        message: error.message
      });

      return Promise.reject({
        success: false,
        message: 'Network error - please check your connection',
        error: error.message
      });
    } else {
      // Error in request setup
      console.error('❌ Request setup error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Request error',
        error: error.message
      });
    }
  }
);

export default apiClient;
