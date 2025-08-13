import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

const BudgetTracker = ({ expenses, categories }) => {
  const [budgets, setBudgets] = useState([]);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80
  });

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('expense_budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save budgets to localStorage
  const saveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    localStorage.setItem('expense_budgets', JSON.stringify(newBudgets));
  };

  const handleAddBudget = (e) => {
    e.preventDefault();
    
    if (!budgetForm.categoryId || !budgetForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.categoryId === budgetForm.categoryId);
    if (existingBudget) {
      alert('Budget already exists for this category. Edit the existing budget instead.');
      return;
    }

    const newBudget = {
      id: Date.now().toString(),
      categoryId: budgetForm.categoryId,
      amount: parseFloat(budgetForm.amount),
      period: budgetForm.period,
      alertThreshold: parseInt(budgetForm.alertThreshold),
      createdAt: new Date().toISOString()
    };

    const newBudgets = [...budgets, newBudget];
    saveBudgets(newBudgets);

    setBudgetForm({
      categoryId: '',
      amount: '',
      period: 'monthly',
      alertThreshold: 80
    });
    setShowAddBudget(false);
  };

  const handleDeleteBudget = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      const newBudgets = budgets.filter(b => b.id !== budgetId);
      saveBudgets(newBudgets);
    }
  };

  const calculateBudgetProgress = (budget) => {
    const category = categories.find(cat => cat.id === budget.categoryId);
    if (!category) return { spent: 0, percentage: 0, remaining: budget.amount };

    // Calculate spending for the current period
    const now = new Date();
    let periodStart, periodEnd;

    switch (budget.period) {
      case 'monthly':
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
    }

    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.categoryId === budget.categoryId &&
             expenseDate >= periodStart &&
             expenseDate <= periodEnd;
    });

    const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    const remaining = Math.max(0, budget.amount - spent);

    return { spent, percentage, remaining };
  };

  const getBudgetStatus = (percentage, alertThreshold) => {
    if (percentage >= 100) return { status: 'exceeded', color: '#ef4444' };
    if (percentage >= alertThreshold) return { status: 'warning', color: '#f59e0b' };
    return { status: 'good', color: '#10b981' };
  };

  const getBudgetAlerts = () => {
    return budgets.map(budget => {
      const { percentage } = calculateBudgetProgress(budget);
      const category = categories.find(cat => cat.id === budget.categoryId);
      
      if (percentage >= budget.alertThreshold) {
        return {
          id: budget.id,
          categoryName: category?.name || 'Unknown',
          percentage: percentage.toFixed(1),
          status: percentage >= 100 ? 'exceeded' : 'warning'
        };
      }
      return null;
    }).filter(alert => alert !== null);
  };

  const alerts = getBudgetAlerts();

  return (
    <div className="budget-tracker">
      <div className="budget-header">
        <h3>Budget Tracker</h3>
        <button 
          onClick={() => setShowAddBudget(true)}
          className="btn btn-primary"
        >
          Add Budget
        </button>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="budget-alerts">
          <h4>⚠️ Budget Alerts</h4>
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`alert alert-${alert.status}`}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                backgroundColor: alert.status === 'exceeded' ? '#fef2f2' : '#fff7ed',
                border: `1px solid ${alert.status === 'exceeded' ? '#fecaca' : '#fed7aa'}`,
                color: alert.status === 'exceeded' ? '#dc2626' : '#d97706'
              }}
            >
              <strong>{alert.categoryName}:</strong> {alert.percentage}% of budget used
              {alert.status === 'exceeded' && ' - Budget exceeded!'}
            </div>
          ))}
        </div>
      )}

      {/* Add Budget Form */}
      {showAddBudget && (
        <div className="budget-form-card">
          <h4>Add New Budget</h4>
          <form onSubmit={handleAddBudget}>
            <div className="form-grid">
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={budgetForm.categoryId}
                  onChange={(e) => setBudgetForm({...budgetForm, categoryId: e.target.value})}
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
                <label>Budget Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Period:</label>
                <select
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alert Threshold (%):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={budgetForm.alertThreshold}
                  onChange={(e) => setBudgetForm({...budgetForm, alertThreshold: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Budget</button>
              <button 
                type="button" 
                onClick={() => setShowAddBudget(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className="budget-list">
        {budgets.length === 0 ? (
          <div className="empty-state">
            <p>No budgets set yet. Create your first budget to start tracking!</p>
          </div>
        ) : (
          budgets.map(budget => {
            const category = categories.find(cat => cat.id === budget.categoryId);
            const { spent, percentage, remaining } = calculateBudgetProgress(budget);
            const { color } = getBudgetStatus(percentage, budget.alertThreshold);

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-info">
                  <div className="budget-header-info">
                    <h4>
                      {category ? (
                        <>
                          <span 
                            style={{
                              display: 'inline-block',
                              width: '12px',
                              height: '12px',
                              backgroundColor: category.color,
                              borderRadius: '50%',
                              marginRight: '8px'
                            }}
                          ></span>
                          {category.name}
                        </>
                      ) : (
                        'Unknown Category'
                      )}
                    </h4>
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="budget-details">
                    <div className="budget-amounts">
                      <span>Spent: ${spent.toFixed(2)}</span>
                      <span>Budget: ${budget.amount.toFixed(2)}</span>
                      <span>Remaining: ${remaining.toFixed(2)}</span>
                    </div>
                    
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: color,
                            height: '20px',
                            borderRadius: '10px',
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <span className="progress-text" style={{ color }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="budget-meta">
                      <small>
                        Period: {budget.period} | Alert at: {budget.alertThreshold}%
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;