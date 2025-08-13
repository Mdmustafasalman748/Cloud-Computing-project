import React, { useState, useEffect } from 'react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

const RecurringExpenses = ({ categories, onExpenseCreate }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [error, setError] = useState('');

  const [recurringForm, setRecurringForm] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    categoryId: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    loadRecurringExpenses();
  }, []);

  const loadRecurringExpenses = () => {
    // Load from localStorage
    const saved = localStorage.getItem('recurring_expenses');
    if (saved) {
      setRecurringExpenses(JSON.parse(saved));
    }
  };

  const saveRecurringExpenses = (expenses) => {
    setRecurringExpenses(expenses);
    localStorage.setItem('recurring_expenses', JSON.stringify(expenses));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!recurringForm.name || !recurringForm.amount || !recurringForm.categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    const newRecurring = {
      id: Date.now().toString(),
      ...recurringForm,
      amount: parseFloat(recurringForm.amount),
      createdAt: new Date().toISOString(),
      lastProcessed: null,
      nextDue: calculateNextDue(recurringForm.startDate, recurringForm.frequency)
    };

    const updatedExpenses = [...recurringExpenses, newRecurring];
    saveRecurringExpenses(updatedExpenses);

    setRecurringForm({
      name: '',
      amount: '',
      currency: 'USD',
      categoryId: '',
      description: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      isActive: true
    });
    setShowAddRecurring(false);
  };

  const calculateNextDue = (startDate, frequency) => {
    const date = new Date(startDate);
    const now = new Date();
    
    // If start date is in the future, return start date
    if (date > now) {
      return date.toISOString();
    }

    // Calculate next due date based on frequency
    let nextDate = new Date(date);
    
    while (nextDate <= now) {
      switch (frequency) {
        case 'daily':
          nextDate = addDays(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
        default:
          nextDate = addMonths(nextDate, 1);
      }
    }

    return nextDate.toISOString();
  };

  const processRecurringExpense = async (recurring) => {
    if (!onExpenseCreate) {
      alert('Cannot create expenses. Please ensure expense creation is enabled.');
      return;
    }

    try {
      // Create the expense
      const expenseData = {
        amount: recurring.amount,
        currency: recurring.currency,
        categoryId: recurring.categoryId,
        description: `${recurring.name} (Recurring)`,
        date: new Date().toISOString()
      };

      // Call the parent function to create expense
      await onExpenseCreate(expenseData);

      // Update the recurring expense
      const updatedRecurring = {
        ...recurring,
        lastProcessed: new Date().toISOString(),
        nextDue: calculateNextDue(recurring.nextDue, recurring.frequency)
      };

      const updatedExpenses = recurringExpenses.map(expense => 
        expense.id === recurring.id ? updatedRecurring : expense
      );
      
      saveRecurringExpenses(updatedExpenses);

      alert(`Recurring expense "${recurring.name}" has been processed successfully!`);
    } catch (error) {
      console.error('Failed to process recurring expense:', error);
      setError('Failed to process recurring expense. Please try again.');
    }
  };

  const toggleRecurringStatus = (id) => {
    const updatedExpenses = recurringExpenses.map(expense =>
      expense.id === id ? { ...expense, isActive: !expense.isActive } : expense
    );
    saveRecurringExpenses(updatedExpenses);
  };

  const deleteRecurringExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      const updatedExpenses = recurringExpenses.filter(expense => expense.id !== id);
      saveRecurringExpenses(updatedExpenses);
    }
  };

  const getDueRecurringExpenses = () => {
    const now = new Date();
    return recurringExpenses.filter(expense => 
      expense.isActive && new Date(expense.nextDue) <= now
    );
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[frequency] || 'Monthly';
  };

  const dueExpenses = getDueRecurringExpenses();

  return (
    <div className="recurring-expenses">
      <div className="recurring-header">
        <h3>Recurring Expenses</h3>
        <button 
          onClick={() => setShowAddRecurring(true)}
          className="btn btn-primary"
        >
          Add Recurring Expense
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Due Expenses Alert */}
      {dueExpenses.length > 0 && (
        <div className="due-expenses-alert">
          <h4>⚠️ Due Recurring Expenses ({dueExpenses.length})</h4>
          <div className="due-expenses-list">
            {dueExpenses.map(expense => {
              const category = categories.find(cat => cat.id === expense.categoryId);
              return (
                <div key={expense.id} className="due-expense-item">
                  <div className="due-expense-info">
                    <span className="expense-name">{expense.name}</span>
                    <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                    <span className="expense-category">{category?.name || 'Unknown'}</span>
                  </div>
                  <button 
                    onClick={() => processRecurringExpense(expense)}
                    className="btn btn-sm btn-primary"
                  >
                    Process Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Recurring Expense Form */}
      {showAddRecurring && (
        <div className="recurring-form-card">
          <h4>Add Recurring Expense</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name: *</label>
                <input
                  type="text"
                  value={recurringForm.name}
                  onChange={(e) => setRecurringForm({...recurringForm, name: e.target.value})}
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount: *</label>
                <input
                  type="number"
                  step="0.01"
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm({...recurringForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Currency:</label>
                <select
                  value={recurringForm.currency}
                  onChange={(e) => setRecurringForm({...recurringForm, currency: e.target.value})}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category: *</label>
                <select
                  value={recurringForm.categoryId}
                  onChange={(e) => setRecurringForm({...recurringForm, categoryId: e.target.value})}
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
                <label>Frequency:</label>
                <select
                  value={recurringForm.frequency}
                  onChange={(e) => setRecurringForm({...recurringForm, frequency: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={recurringForm.startDate}
                  onChange={(e) => setRecurringForm({...recurringForm, startDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>End Date (Optional):</label>
                <input
                  type="date"
                  value={recurringForm.endDate}
                  onChange={(e) => setRecurringForm({...recurringForm, endDate: e.target.value})}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Description:</label>
                <input
                  type="text"
                  value={recurringForm.description}
                  onChange={(e) => setRecurringForm({...recurringForm, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Recurring Expense</button>
              <button 
                type="button" 
                onClick={() => setShowAddRecurring(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recurring Expenses List */}
      <div className="recurring-list">
        {recurringExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No recurring expenses set up. Add your first recurring expense to automate your budgeting!</p>
          </div>
        ) : (
          recurringExpenses.map(expense => {
            const category = categories.find(cat => cat.id === expense.categoryId);
            const isOverdue = new Date(expense.nextDue) <= new Date();
            
            return (
              <div key={expense.id} className={`recurring-card ${!expense.isActive ? 'inactive' : ''} ${isOverdue ? 'overdue' : ''}`}>
                <div className="recurring-card-header">
                  <div className="recurring-info">
                    <h4>{expense.name}</h4>
                    <p className="recurring-description">{expense.description}</p>
                  </div>
                  
                  <div className="recurring-actions">
                    <button 
                      onClick={() => toggleRecurringStatus(expense.id)}
                      className={`btn btn-sm ${expense.isActive ? 'btn-outline' : 'btn-primary'}`}
                      title={expense.isActive ? 'Pause' : 'Resume'}
                    >
                      {expense.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      onClick={() => deleteRecurringExpense(expense.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="recurring-details">
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{expense.currency} {expense.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">
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
                        'Unknown'
                      )}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">{getFrequencyLabel(expense.frequency)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Next Due:</span>
                    <span className={`detail-value ${isOverdue ? 'overdue-text' : ''}`}>
                      {format(new Date(expense.nextDue), 'MMM dd, yyyy')}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                  
                  {expense.lastProcessed && (
                    <div className="detail-item">
                      <span className="detail-label">Last Processed:</span>
                      <span className="detail-value">
                        {format(new Date(expense.lastProcessed), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {isOverdue && expense.isActive && (
                  <div className="process-button-container">
                    <button 
                      onClick={() => processRecurringExpense(expense)}
                      className="btn btn-primary btn-sm"
                    >
                      Process Now
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecurringExpenses;