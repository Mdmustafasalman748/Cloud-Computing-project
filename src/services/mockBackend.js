// src/services/mockBackend.js
// Temporary mock backend to simulate API responses while CORS is being fixed

const MOCK_DELAY = 1000; // Simulate network delay

// Mock user data
let mockUser = null;
let mockToken = null;
let mockCategories = [
  {
    id: "mock-cat-1",
    userId: "mock-user-1",
    name: "Groceries",
    color: "#FF5733"
  },
  {
    id: "mock-cat-2", 
    userId: "mock-user-1",
    name: "Transportation",
    color: "#3b82f6"
  }
];

let mockExpenses = [
  {
    id: "mock-exp-1",
    userId: "mock-user-1",
    amount: 50.75,
    currency: "USD",
    categoryId: "mock-cat-1",
    date: "2025-01-09T14:30:00Z",
    description: "Weekly groceries",
    createdAt: "2025-01-09T14:30:00Z",
    updatedAt: "2025-01-09T14:30:00Z"
  },
  {
    id: "mock-exp-2",
    userId: "mock-user-1", 
    amount: 25.00,
    currency: "USD",
    categoryId: "mock-cat-2",
    date: "2025-01-08T09:15:00Z",
    description: "Bus fare",
    createdAt: "2025-01-08T09:15:00Z",
    updatedAt: "2025-01-08T09:15:00Z"
  }
];

// Helper function to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate mock IDs
const generateId = () => 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

export const mockBackend = {
  // Mock Auth API
  auth: {
    register: async (userData) => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Registering user', userData);
      
      // Simulate user creation
      mockUser = {
        id: "mock-user-1",
        email: userData.email,
        fullName: userData.fullName,
        roles: ["USER"]
      };
      
      mockToken = "mock-jwt-token-" + Date.now();
      
      return {
        success: true,
        data: {
          accessToken: mockToken,
          expiresIn: 3600000
        }
      };
    },

    login: async (credentials) => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Logging in user', credentials.email);
      
      // Simulate existing user
      mockUser = {
        id: "mock-user-1",
        email: credentials.email,
        fullName: "Mock User",
        roles: ["USER"]
      };
      
      mockToken = "mock-jwt-token-" + Date.now();
      
      return {
        success: true,
        data: {
          accessToken: mockToken,
          expiresIn: 3600000
        }
      };
    },

    getCurrentUser: async () => {
      await delay(MOCK_DELAY);
      
      if (!mockToken) {
        throw new Error('Not authenticated');
      }
      
      return {
        success: true,
        data: mockUser
      };
    }
  },

  // Mock Categories API
  categories: {
    getAll: async () => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Getting categories');
      
      return {
        success: true,
        data: mockCategories
      };
    },

    create: async (categoryData) => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Creating category', categoryData);
      
      const newCategory = {
        id: generateId(),
        userId: mockUser?.id || "mock-user-1",
        ...categoryData
      };
      
      mockCategories.push(newCategory);
      
      return {
        success: true,
        data: newCategory
      };
    },

    update: async (id, categoryData) => {
      await delay(MOCK_DELAY);
      
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return {
          success: false,
          error: 'Category not found'
        };
      }
      
      mockCategories[categoryIndex] = {
        ...mockCategories[categoryIndex],
        ...categoryData
      };
      
      return {
        success: true,
        data: mockCategories[categoryIndex]
      };
    },

    delete: async (id) => {
      await delay(MOCK_DELAY);
      
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return {
          success: false,
          error: 'Category not found'
        };
      }
      
      mockCategories.splice(categoryIndex, 1);
      
      return {
        success: true
      };
    }
  },

  // Mock Expenses API
  expenses: {
    getAll: async () => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Getting expenses');
      
      return {
        success: true,
        data: mockExpenses
      };
    },

    getById: async (id) => {
      await delay(MOCK_DELAY);
      
      const expense = mockExpenses.find(exp => exp.id === id);
      if (!expense) {
        return {
          success: false,
          error: 'Expense not found'
        };
      }
      
      return {
        success: true,
        data: expense
      };
    },

    create: async (expenseData) => {
      await delay(MOCK_DELAY);
      
      console.log('🤖 Mock Backend: Creating expense', expenseData);
      
      const newExpense = {
        id: generateId(),
        userId: mockUser?.id || "mock-user-1",
        ...expenseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockExpenses.push(newExpense);
      
      return {
        success: true,
        data: newExpense
      };
    },

    update: async (id, expenseData) => {
      await delay(MOCK_DELAY);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) {
        return {
          success: false,
          error: 'Expense not found'
        };
      }
      
      mockExpenses[expenseIndex] = {
        ...mockExpenses[expenseIndex],
        ...expenseData,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: mockExpenses[expenseIndex]
      };
    },

    delete: async (id) => {
      await delay(MOCK_DELAY);
      
      const expenseIndex = mockExpenses.findIndex(exp => exp.id === id);
      if (expenseIndex === -1) {
        return {
          success: false,
          error: 'Expense not found'
        };
      }
      
      mockExpenses.splice(expenseIndex, 1);
      
      return {
        success: true
      };
    }
  }
};