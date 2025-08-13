// src/services/categories.js
import api from './api';
import { mockBackend } from './mockBackend';

// Toggle between real and mock backend
const USE_MOCK_BACKEND = false; // CHANGED: Now using real backend

export const categoriesService = {
  // Get all categories
  getAll: async () => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for categories.getAll');
      return await mockBackend.categories.getAll();
    }

    try {
      const response = await api.get('/categories');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get categories error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  },

  // Create new category
  create: async (categoryData) => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for categories.create');
      return await mockBackend.categories.create(categoryData);
    }

    try {
      const response = await api.post('/categories', categoryData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Create category error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category'
      };
    }
  },

  // Update category
  update: async (id, categoryData) => {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.categories.update(id, categoryData);
    }

    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category'
      };
    }
  },

  // Delete category
  delete: async (id) => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for categories.delete');
      return await mockBackend.categories.delete(id);
    }

    try {
      await api.delete(`/categories/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Delete category error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category'
      };
    }
  }
};