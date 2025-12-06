import axios from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Token management
export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token) => localStorage.setItem('auth_token', token);
export const clearToken = () => localStorage.removeItem('auth_token');

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      clearToken();
      // Dispatch logout action or redirect - handled by component
      window.location.href = '/signin';
    }
    
    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied', error.response.data);
    }

    return Promise.reject(error);
  }
);

// API Methods
const apiClient = {
  // GET requests
  get: (url, config = {}) => {
    return axiosInstance.get(url, config)
      .then(response => response.data)
      .catch(error => {
        console.error('GET Error:', error.response?.data || error.message);
        throw error.response?.data || { message: error.message };
      });
  },

  // POST requests
  post: (url, data, config = {}) => {
    console.log('[apiClient] POST request to:', url, 'data:', data);
    return axiosInstance.post(url, data, config)
      .then(response => {
        console.log('[apiClient] POST response received:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('[apiClient] POST Error:', error.response?.data || error.message);
        const errorData = error.response?.data;
        // If error has a proper structure, pass it along
        if (errorData) {
          throw errorData;
        }
        // Otherwise throw a structured error
        throw { 
          success: false,
          message: error.message || 'Request failed'
        };
      });
  },

  // PUT requests
  put: (url, data, config = {}) => {
    return axiosInstance.put(url, data, config)
      .then(response => response.data)
      .catch(error => {
        console.error('PUT Error:', error.response?.data || error.message);
        throw error.response?.data || { message: error.message };
      });
  },

  // PATCH requests
  patch: (url, data, config = {}) => {
    return axiosInstance.patch(url, data, config)
      .then(response => response.data)
      .catch(error => {
        console.error('PATCH Error:', error.response?.data || error.message);
        throw error.response?.data || { message: error.message };
      });
  },

  // DELETE requests
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config)
      .then(response => response.data)
      .catch(error => {
        console.error('DELETE Error:', error.response?.data || error.message);
        throw error.response?.data || { message: error.message };
      });
  },
};

export default apiClient;
