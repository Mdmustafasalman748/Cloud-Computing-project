
// Here's the updated expenses.js file:

// src/services/expenses.js
import api from './api';
import { mockBackend } from './mockBackend';

// Toggle between real and mock backend
const USE_MOCK_BACKEND = false; // CHANGED: Now using real backend

export const expensesService = {
  // Get all expenses
  getAll: async () => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for expenses.getAll');
      return await mockBackend.expenses.getAll();
    }

    try {
      const response = await api.get('/expenses');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get expenses error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch expenses'
      };
    }
  },

  // Get expense by ID
  getById: async (id) => {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.expenses.getById(id);
    }

    try {
      const response = await api.get(`/expenses/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch expense'
      };
    }
  },

  // Create new expense
  create: async (expenseData) => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for expenses.create');
      return await mockBackend.expenses.create(expenseData);
    }

    try {
      const response = await api.post('/expenses', expenseData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Create expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create expense'
      };
    }
  },

  // Update expense
  update: async (id, expenseData) => {
    if (USE_MOCK_BACKEND) {
      return await mockBackend.expenses.update(id, expenseData);
    }

    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Update expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update expense'
      };
    }
  },

  // Delete expense
  delete: async (id) => {
    if (USE_MOCK_BACKEND) {
      console.log('🤖 Using Mock Backend for expenses.delete');
      return await mockBackend.expenses.delete(id);
    }

    try {
      await api.delete(`/expenses/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Delete expense error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete expense'
      };
    }
  }
};