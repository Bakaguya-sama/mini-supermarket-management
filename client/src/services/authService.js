// services/authService.js - Authentication Service
import apiClient from './apiClient';

/**
 * Login user
 * @param {Object} credentials - { username, password }
 * @returns {Promise}
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Save token if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register customer
 * @param {Object} userData - Customer registration data
 * @returns {Promise}
 */
export const registerCustomer = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register/customer', userData);
    
    // Save token if registration successful
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Send forgot password verification code
 * @param {string} email - User's email
 * @returns {Promise}
 */
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Verify reset code and reset password
 * @param {Object} data - { email, code, newPassword }
 * @returns {Promise}
 */
export const verifyResetCode = async (data) => {
  try {
    const response = await apiClient.post('/auth/verify-reset-code', data);
    return response;
  } catch (error) {
    console.error('Verify reset code error:', error);
    throw error;
  }
};

/**
 * Resend verification code
 * @param {string} email - User's email
 * @returns {Promise}
 */
export const resendVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/auth/resend-verification-code', { email });
    return response;
  } catch (error) {
    console.error('Resend code error:', error);
    throw error;
  }
};

/**
 * Change password (authenticated user)
 * @param {Object} data - { current_password, new_password }
 * @returns {Promise}
 */
export const changePassword = async (data) => {
  try {
    const response = await apiClient.put('/auth/change-password', data);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile update data
 * @returns {Promise}
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/auth/update-profile', profileData);
    
    // Update user in localStorage if successful
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Get current user profile from server
 * @returns {Promise}
 */
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    
    // Update user in localStorage
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  } catch (error) {
    console.error('Get me error:', error);
    throw error;
  }
};

export default {
  login,
  registerCustomer,
  logout,
  getCurrentUser,
  isAuthenticated,
  forgotPassword,
  verifyResetCode,
  resendVerificationCode,
  changePassword,
  updateProfile,
  getMe,
};
