// src/services/api.js
import axios from 'axios';

// Axios instance with baseURL pointing to your backend
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Matches Spring Boot's /api/auth/** path
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    }
    console.log(`🔄 Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and token expiry
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}`, response);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);

    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized — clearing session');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
