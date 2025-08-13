import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  startOfWeek,
  endOfWeek,
  subMonths,
  subYears,
  eachDayOfInterval
} from 'date-fns';

const ExpenseSummary = ({ expenses, categories }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [comparisonPeriod, setComparisonPeriod] = useState('lastMonth');
  const [showComparison, setShowComparison] = useState(true);

  const getPeriodData = (period, referenceDate = new Date()) => {
    let startDate, endDate, label;

    switch (period) {
      case 'thisWeek':
        startDate = startOfWeek(referenceDate);
        endDate = endOfWeek(referenceDate);
        label = 'This Week';
        break;
      case 'lastWeek':
        const lastWeek = new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = startOfWeek(lastWeek);
        endDate = endOfWeek(lastWeek);
        label = 'Last Week';
        break;
      case 'thisMonth':
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        label = format(referenceDate, 'MMMM yyyy');
        break;
      case 'lastMonth':
        const lastMonth = subMonths(referenceDate, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        label = format(lastMonth, 'MMMM yyyy');
        break;
      case 'thisYear':
        startDate = startOfYear(referenceDate);
        endDate = endOfYear(referenceDate);
        label = format(referenceDate, 'yyyy');
        break;
      case 'lastYear':
        const lastYear = subYears(referenceDate, 1);
        startDate = startOfYear(lastYear);
        endDate = endOfYear(lastYear);
        label = format(lastYear, 'yyyy');
        break;
      default:
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        label = format(referenceDate, 'MMMM yyyy');
    }

    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    return {
      startDate,
      endDate,
      label,
      expenses: periodExpenses,
      total: periodExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      count: periodExpenses.length
    };
  };

  const getCategoryBreakdown = (expenses) => {
    const breakdown = {};
    let totalAmount = 0;

    expenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category?.name || 'Unknown';
      const categoryColor = category?.color || '#gray';

      if (!breakdown[categoryName]) {
        breakdown[categoryName] = {
          name: categoryName,
          color: categoryColor,
          amount: 0,
          count: 0,
          percentage: 0
        };
      }

      breakdown[categoryName].amount += expense.amount;
      breakdown[categoryName].count += 1;
      totalAmount += expense.amount;
    });

    // Calculate percentages
    Object.keys(breakdown).forEach(category => {
      breakdown[category].percentage = totalAmount > 0 
        ? (breakdown[category].amount / totalAmount) * 100 
        : 0;
    });

    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  };

  const getTopExpenses = (expenses, limit = 5) => {
    return expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        return {
          ...expense,
          categoryName: category?.name || 'Unknown',
          categoryColor: category?.color || '#gray'
        };
      });
  };

  const getSpendingTrend = (expenses) => {
    if (expenses.length === 0) return [];

    // Group by day for current month view
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailySpending = {};
    daysInMonth.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      dailySpending[dayKey] = 0;
    });

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= monthStart && expenseDate <= monthEnd) {
        const dayKey = format(expenseDate, 'yyyy-MM-dd');
        if (dailySpending[dayKey] !== undefined) {
          dailySpending[dayKey] += expense.amount;
        }
      }
    });

    return daysInMonth.map(day => ({
      date: day,
      amount: dailySpending[format(day, 'yyyy-MM-dd')],
      label: format(day, 'd')
    }));
  };

  const getAverages = (expenses, period) => {
    if (expenses.length === 0) return { daily: 0, transaction: 0 };

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    let days = 1;

    if (period.includes('Month')) {
      const start = new Date(Math.min(...expenses.map(e => new Date(e.date))));
      const end = new Date(Math.max(...expenses.map(e => new Date(e.date))));
      days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    } else if (period.includes('Year')) {
      days = 365;
    } else if (period.includes('Week')) {
      days = 7;
    }

    return {
      daily: total / days,
      transaction: total / expenses.length
    };
  };

  const currentData = getPeriodData(selectedPeriod);
  const comparisonData = showComparison ? getPeriodData(comparisonPeriod) : null;
  const categoryBreakdown = getCategoryBreakdown(currentData.expenses);
  const topExpenses = getTopExpenses(currentData.expenses);
  const spendingTrend = getSpendingTrend(expenses);
  const averages = getAverages(currentData.expenses, selectedPeriod);

  const getChangePercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="expense-summary">
      <div className="summary-header">
        <h3>Expense Summary</h3>
        <div className="period-selector">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
          
          <label className="comparison-toggle">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
            />
            Show Comparison
          </label>
          
          {showComparison && (
            <select
              value={comparisonPeriod}
              onChange={(e) => setComparisonPeriod(e.target.value)}
            >
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="summary-stats">
        <div className="stat-card main-stat">
          <div className="stat-header">
            <h4>Total Spending</h4>
            <span className="stat-period">{currentData.label}</span>
          </div>
          <div className="stat-value">{formatCurrency(currentData.total)}</div>
          {showComparison && comparisonData && (
            <div className="stat-comparison">
              <span className={`change ${currentData.total > comparisonData.total ? 'increase' : 'decrease'}`}>
                {currentData.total > comparisonData.total ? '↑' : '↓'}
                {Math.abs(getChangePercentage(currentData.total, comparisonData.total)).toFixed(1)}%
              </span>
              <span>vs {comparisonData.label}</span>
            </div>
          )}
        </div>

        <div className="stat-card">
          <h4>Transactions</h4>
          <div className="stat-value">{currentData.count}</div>
          {showComparison && comparisonData && (
            <div className="stat-comparison">
              <span className={`change ${currentData.count > comparisonData.count ? 'increase' : 'decrease'}`}>
                {currentData.count > comparisonData.count ? '↑' : '↓'}
                {Math.abs(getChangePercentage(currentData.count, comparisonData.count)).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="stat-card">
          <h4>Daily Average</h4>
          <div className="stat-value">{formatCurrency(averages.daily)}</div>
        </div>

        <div className="stat-card">
          <h4>Avg per Transaction</h4>
          <div className="stat-value">{formatCurrency(averages.transaction)}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="summary-section">
        <h4>Spending by Category</h4>
        <div className="category-breakdown">
          {categoryBreakdown.length === 0 ? (
            <p className="empty-message">No expenses in this period</p>
          ) : (
            categoryBreakdown.map(category => (
              <div key={category.name} className="category-item">
                <div className="category-info">
                  <div className="category-label">
                    <span 
                      className="category-color"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-stats">
                    <span className="amount">{formatCurrency(category.amount)}</span>
                    <span className="percentage">{category.percentage.toFixed(1)}%</span>
                    <span className="count">{category.count} transactions</span>
                  </div>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-progress"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="summary-section">
        <h4>Largest Expenses</h4>
        <div className="top-expenses">
          {topExpenses.length === 0 ? (
            <p className="empty-message">No expenses in this period</p>
          ) : (
            topExpenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <div className="expense-description">{expense.description}</div>
                  <div className="expense-meta">
                    <span className="expense-category">
                      <span 
                        className="category-dot"
                        style={{ backgroundColor: expense.categoryColor }}
                      ></span>
                      {expense.categoryName}
                    </span>
                    <span className="expense-date">
                      {format(new Date(expense.date), 'MMM dd')}
                    </span>
                  </div>
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spending Trend */}
      {spendingTrend.length > 0 && (
        <div className="summary-section">
          <h4>Daily Spending Trend - {format(new Date(), 'MMMM yyyy')}</h4>
          <div className="trend-chart">
            <div className="trend-bars">
              {spendingTrend.map((day, index) => {
                const maxAmount = Math.max(...spendingTrend.map(d => d.amount));
                const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={index} className="trend-bar-container">
                    <div 
                      className="trend-bar"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.label}: ${formatCurrency(day.amount)}`}
                    ></div>
                    <span className="trend-label">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="summary-section">
        <h4>💡 Insights</h4>
        <div className="insights">
          {categoryBreakdown.length > 0 && (
            <div className="insight-item">
              <strong>Top Category:</strong> {categoryBreakdown[0].name} accounts for {categoryBreakdown[0].percentage.toFixed(1)}% of your spending
            </div>
          )}
          
          {averages.daily > 0 && (
            <div className="insight-item">
              <strong>Spending Pattern:</strong> You spend an average of {formatCurrency(averages.daily)} per day
            </div>
          )}
          
          {showComparison && comparisonData && (
            <div className="insight-item">
              <strong>Period Comparison:</strong> 
              {currentData.total > comparisonData.total 
                ? ` You spent ${formatCurrency(currentData.total - comparisonData.total)} more than ${comparisonData.label.toLowerCase()}`
                : ` You saved ${formatCurrency(comparisonData.total - currentData.total)} compared to ${comparisonData.label.toLowerCase()}`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;