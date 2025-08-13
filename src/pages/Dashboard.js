// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expensesService } from '../services/expenses';
import { categoriesService } from '../services/categories';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: 'USD',
    categoryId: '',
    description: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#FF5733'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expensesResult, categoriesResult] = await Promise.all([
        expensesService.getAll(),
        categoriesService.getAll()
      ]);

      if (expensesResult.success) {
        setExpenses(expensesResult.data);
      } else {
        console.error('Failed to load expenses:', expensesResult.error);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      } else {
        console.error('Failed to load categories:', categoriesResult.error);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle expense form submission
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');

    if (!expenseForm.amount || !expenseForm.categoryId || !expenseForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        amount: parseFloat(expenseForm.amount),
        currency: expenseForm.currency,
        categoryId: expenseForm.categoryId,
        description: expenseForm.description,
        date: new Date(expenseForm.date).toISOString()
      };

      const result = await expensesService.create(expenseData);
      
      if (result.success) {
        setExpenseForm({
          amount: '',
          currency: 'USD',
          categoryId: '',
          description: '',
          date: new Date().toISOString().slice(0, 16)
        });
        setShowAddExpense(false);
        loadData(); // Reload data
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      setError('Failed to add expense. Please try again.');
    }
  };

  // Handle category form submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryForm.name) {
      setError('Please enter a category name');
      return;
    }

    try {
      const result = await categoriesService.create(categoryForm);
      
      if (result.success) {
        setCategoryForm({ name: '', color: '#FF5733' });
        setShowAddCategory(false);
        loadData(); // Reload data
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      setError('Failed to add category. Please try again.');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const result = await expensesService.delete(id);
        if (result.success) {
          loadData(); // Reload data
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Failed to delete expense:', error);
        setError('Failed to delete expense. Please try again.');
      }
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName}</h1>
          <p>Track your expenses and manage your budget</p>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Expenses</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Total Transactions</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
              {expenses.length}
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Categories</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>
              {categories.length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary"
          >
            Add Expense
          </button>
          <button 
            onClick={() => setShowAddCategory(true)}
            className="btn btn-secondary"
          >
            Add Category
          </button>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Amount:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Currency:</label>
                  <select
                    value={expenseForm.currency}
                    onChange={(e) => setExpenseForm({...expenseForm, currency: e.target.value})}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={expenseForm.categoryId}
                    onChange={(e) => setExpenseForm({...expenseForm, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="datetime-local"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  placeholder="Enter description"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Add Expense</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddExpense(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
            <h3>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category Name:</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                    style={{ width: '60px', height: '42px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddCategory(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
          <h3>Categories ({categories.length})</h3>
          {categories.length === 0 ? (
            <p>No categories yet. Add your first category above!</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.map(category => (
                <div 
                  key={category.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: category.color + '20',
                    border: `2px solid ${category.color}`,
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}
                >
                  <div 
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: category.color,
                      borderRadius: '50%'
                    }}
                  ></div>
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="dashboard-card">
          <h3>Recent Expenses ({expenses.length})</h3>
          {expenses.length === 0 ? (
            <p>No expenses yet. Add your first expense above!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => {
                    const category = categories.find(cat => cat.id === expense.categoryId);
                    return (
                      <tr key={expense.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>{expense.description}</td>
                        <td style={{ padding: '1rem' }}>
                          {category ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div 
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: category.color,
                                  borderRadius: '50%'
                                }}
                              ></div>
                              {category.name}
                            </div>
                          ) : (
                            'Unknown'
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                          {expense.currency} {expense.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteExpense(expense.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;