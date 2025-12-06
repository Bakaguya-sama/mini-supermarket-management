import apiClient, { setToken, clearToken } from './apiClient';

/**
 * Authentication Service
 * Handles user login, registration, logout, and token management
 */

const authService = {
  /**
   * Login with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<{token, user}>} JWT token and user data
   */
  login: async (username, password) => {
    try {
      console.log('[authService] Calling login API with username:', username);
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      console.log('[authService] Full login response:', response);
      console.log('[authService] response.success:', response?.success);
      console.log('[authService] response.data:', response?.data);
      console.log('[authService] response.data.token:', response?.data?.token);

      // The response structure from apiClient is: {success, message, data: {token, user}}
      if (response && response.success && response.data && response.data.token) {
        console.log('[authService] ✅ Token found, storing authentication data');
        const { token, user } = response.data;
        
        // Store JWT token
        setToken(token);
        console.log('[authService] ✅ Token stored:', token.substring(0, 20) + '...');
        
        // Store user info in localStorage for Layout component
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.fullName || user.username);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user._id);
        console.log('[authService] ✅ User data stored:', { 
          isLoggedIn: true, 
          userName: user.fullName || user.username, 
          userRole: user.role,
          userId: user._id
        });
        
        return response.data;
      }
      
      console.error('[authService] ❌ Invalid response structure:', response);
      const errorMsg = response?.message || 'Login failed';
      throw new Error(errorMsg);
    } catch (error) {
      console.error('[authService] ❌ Login error caught:', error);
      console.error('[authService] Error message:', error?.message);
      console.error('[authService] Error details:', error);
      throw error;
    }
  },

  /**
   * Register a new customer account
   * @param {string} email - User's email
   * @param {string} username - Desired username
   * @param {string} password - Desired password
   * @param {string} fullName - User's full name
   * @returns {Promise<{token, user}>} JWT token and user data
   */
  register: async (email, username, password, fullName) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
        fullName,
      });

      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
        
        // Store user info in localStorage for Layout component
        const user = response.data.user;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.fullName || user.username);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user._id);
        
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<user>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch user');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    clearToken();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

export default authService;
