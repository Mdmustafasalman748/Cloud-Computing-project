import React, { useState, useEffect } from 'react';
import { expensesService } from '../services/expenses';
import { categoriesService } from '../services/categories';
import ExpenseCharts from '../components/ExpenseCharts';
import ExpenseFilters from '../components/ExpenseFilters';
import BudgetTracker from '../components/BudgetTracker';
import ExpenseExport from '../components/ExpenseExport';
import CategoryManager from '../components/CategoryManager';
import RecurringExpenses from '../components/RecurringExpenses';
import ReceiptUpload from '../components/ReceiptUpload';
import ExpenseSummary from '../components/ExpenseSummary';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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
        setFilteredExpenses(expensesResult.data);
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

  const handleFilterChange = (filtered, filterCriteria) => {
    setFilteredExpenses(filtered);
  };

  const handleCategoryUpdate = (updatedCategories) => {
    setCategories(updatedCategories);
    setExpenses(currentExpenses => [...currentExpenses]);
  };

  const handleExpenseCreate = async (expenseData) => {
    try {
      const result = await expensesService.create(expenseData);
      if (result.success) {
        loadData(); // Reload all data
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  };

  const getAnalyticsSummary = () => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const yearStart = startOfYear(currentMonth);
    const yearEnd = endOfYear(currentMonth);

    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const thisYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= yearStart && expenseDate <= yearEnd;
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalThisYear = thisYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAllTime = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate average daily spending this month
    // const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const currentDay = currentMonth.getDate();
    const avgDailySpending = totalThisMonth / currentDay;

    // Most expensive category
    const categoryTotals = {};
    expenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category?.name || 'Unknown';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += expense.amount;
    });

    const topCategory = Object.entries(categoryTotals).reduce((top, [name, amount]) => {
      return amount > top.amount ? { name, amount } : top;
    }, { name: 'None', amount: 0 });

    return {
      totalThisMonth,
      totalThisYear,
      totalAllTime,
      avgDailySpending,
      topCategory,
      transactionsThisMonth: thisMonthExpenses.length,
      transactionsThisYear: thisYearExpenses.length,
      totalTransactions: expenses.length
    };
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const summary = getAnalyticsSummary();

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <h1>Expense Analytics</h1>
          <p>Comprehensive insights into your spending patterns</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Quick Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <h3>This Month</h3>
            <div className="summary-value">${summary.totalThisMonth.toFixed(2)}</div>
            <div className="summary-detail">{summary.transactionsThisMonth} transactions</div>
          </div>
          <div className="summary-card">
            <h3>This Year</h3>
            <div className="summary-value">${summary.totalThisYear.toFixed(2)}</div>
            <div className="summary-detail">{summary.transactionsThisYear} transactions</div>
          </div>
          <div className="summary-card">
            <h3>All Time</h3>
            <div className="summary-value">${summary.totalAllTime.toFixed(2)}</div>
            <div className="summary-detail">{summary.totalTransactions} transactions</div>
          </div>
          <div className="summary-card">
            <h3>Daily Average</h3>
            <div className="summary-value">${summary.avgDailySpending.toFixed(2)}</div>
            <div className="summary-detail">This month</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'charts' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('charts')}
          >
            Charts & Graphs
          </button>
          <button 
            className={activeTab === 'filters' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('filters')}
          >
            Filters & Search
          </button>
          <button 
            className={activeTab === 'budget' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('budget')}
          >
            Budget Tracking
          </button>
          <button 
            className={activeTab === 'export' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('export')}
          >
            Export Data
          </button>
          <button 
            className={activeTab === 'categories' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={activeTab === 'recurring' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('recurring')}
          >
            Recurring
          </button>
          <button 
            className={activeTab === 'receipts' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('receipts')}
          >
            Receipts
          </button>
          <button 
            className={activeTab === 'summary' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Top Spending Category</h3>
                  <div className="category-info">
                    <div className="category-name">{summary.topCategory.name}</div>
                    <div className="category-amount">${summary.topCategory.amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="overview-card">
                  <h3>Recent Activity</h3>
                  <div className="recent-expenses">
                    {expenses.slice(0, 5).map(expense => {
                      // const category = categories.find(cat => cat.id === expense.categoryId);
                      return (
                        <div key={expense.id} className="recent-expense-item">
                          <span className="expense-desc">{expense.description}</span>
                          <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="charts-preview">
                <ExpenseCharts expenses={expenses} categories={categories} />
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="charts-tab">
              <ExpenseCharts expenses={filteredExpenses} categories={categories} />
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="filters-tab">
              <ExpenseFilters 
                expenses={expenses} 
                categories={categories} 
                onFilterChange={handleFilterChange}
              />
              
              {/* Filtered Results Preview */}
              <div className="filtered-results">
                <h3>Filtered Results ({filteredExpenses.length} items)</h3>
                <div className="filtered-summary">
                  <div className="filtered-stat">
                    <span>Total Amount:</span>
                    <span>${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="budget-tab">
              <BudgetTracker expenses={expenses} categories={categories} />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="export-tab">
              <ExpenseExport 
                expenses={expenses} 
                categories={categories}
                filteredExpenses={filteredExpenses}
              />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="categories-tab">
              <CategoryManager 
                onCategoryUpdate={handleCategoryUpdate}
                initialCategories={categories}
              />
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="recurring-tab">
              <RecurringExpenses 
                categories={categories}
                onExpenseCreate={handleExpenseCreate}
              />
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="receipts-tab">
              <ReceiptUpload />
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="summary-tab">
              <ExpenseSummary expenses={expenses} categories={categories} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;