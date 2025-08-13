import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const ExpenseFilters = ({ expenses, categories, onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    customStartDate: '',
    customEndDate: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters
    const filteredExpenses = applyFilters(expenses, newFilters);
    onFilterChange(filteredExpenses, newFilters);
  };

  const applyFilters = (expenseList, filterCriteria) => {
    return expenseList.filter(expense => {
      // Search filter
      if (filterCriteria.search) {
        const searchLower = filterCriteria.search.toLowerCase();
        if (!expense.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filterCriteria.categoryId && expense.categoryId !== filterCriteria.categoryId) {
        return false;
      }

      // Amount filters
      if (filterCriteria.minAmount && expense.amount < parseFloat(filterCriteria.minAmount)) {
        return false;
      }
      if (filterCriteria.maxAmount && expense.amount > parseFloat(filterCriteria.maxAmount)) {
        return false;
      }

      // Date range filter
      const expenseDate = new Date(expense.date);
      const now = new Date();

      switch (filterCriteria.dateRange) {
        case 'today':
          const today = new Date();
          if (expenseDate.toDateString() !== today.toDateString()) {
            return false;
          }
          break;
        case 'thisWeek':
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          if (expenseDate < weekStart || expenseDate > weekEnd) {
            return false;
          }
          break;
        case 'thisMonth':
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);
          if (expenseDate < monthStart || expenseDate > monthEnd) {
            return false;
          }
          break;
        case 'thisYear':
          const yearStart = startOfYear(now);
          const yearEnd = endOfYear(now);
          if (expenseDate < yearStart || expenseDate > yearEnd) {
            return false;
          }
          break;
        case 'custom':
          if (filterCriteria.customStartDate) {
            const startDate = new Date(filterCriteria.customStartDate);
            if (expenseDate < startDate) {
              return false;
            }
          }
          if (filterCriteria.customEndDate) {
            const endDate = new Date(filterCriteria.customEndDate);
            if (expenseDate > endDate) {
              return false;
            }
          }
          break;
        default:
          // 'all' - no date filter
          break;
      }

      return true;
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
      customStartDate: '',
      customEndDate: ''
    };
    setFilters(clearedFilters);
    onFilterChange(expenses, clearedFilters);
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.categoryId) {
      const category = categories.find(cat => cat.id === filters.categoryId);
      activeFilters.push(`Category: ${category?.name || 'Unknown'}`);
    }
    if (filters.dateRange !== 'all') {
      activeFilters.push(`Date: ${filters.dateRange}`);
    }
    if (filters.minAmount) activeFilters.push(`Min: $${filters.minAmount}`);
    if (filters.maxAmount) activeFilters.push(`Max: $${filters.maxAmount}`);
    
    return activeFilters;
  };

  return (
    <div className="expense-filters">
      <div className="filters-header">
        <h3>Filter Expenses</h3>
        <button onClick={clearFilters} className="btn btn-outline">
          Clear All Filters
        </button>
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-group">
          <label>Search Description:</label>
          <input
            type="text"
            placeholder="Search by description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label>Date Range:</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="filter-group">
          <label>Min Amount:</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Max Amount:</label>
          <input
            type="number"
            step="0.01"
            placeholder="No limit"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="custom-date-range">
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {getFilterSummary().length > 0 && (
        <div className="active-filters">
          <strong>Active Filters:</strong>
          <div className="filter-tags">
            {getFilterSummary().map((filter, index) => (
              <span key={index} className="filter-tag">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;