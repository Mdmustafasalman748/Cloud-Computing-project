// src/services/auth.js
import api from './api';

export const authService = {
  // REGISTER
  register: async (userData) => {
    try {
      console.log('🌐 Registering with real backend...');
      const response = await api.post('/v1/auth/register', userData);
      const { accessToken, expiresIn } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenExpiry', Date.now() + expiresIn);

      const userResponse = await api.get('/users/me');
      const user = userResponse.data;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: { user, accessToken },
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  },

  // LOGIN
  login: async (credentials) => {
    try {
      console.log('Logging in with real backend...');
      const response = await api.post('/v1/auth/login', credentials);
      const { accessToken, expiresIn } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenExpiry', Date.now() + expiresIn);

      const userResponse = await api.get('/users/me');
      const user = userResponse.data;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: { user, accessToken },
      };
    } catch (error) {
      console.error(' Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  },

  // GET CURRENT USER
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // IS AUTHENTICATED
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');
    if (!token || !expiry || Date.now() >= parseInt(expiry)) {
      authService.logout();
      return false;
    }
    return true;
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  },
};
