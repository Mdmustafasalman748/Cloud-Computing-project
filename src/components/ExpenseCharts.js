import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseCharts = ({ expenses, categories }) => {
  // Category breakdown chart data
  const getCategoryChartData = () => {
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category ? category.name : 'Unknown';
      const categoryColor = category ? category.color : '#gray';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          total: 0,
          color: categoryColor
        };
      }
      categoryTotals[categoryName].total += expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = labels.map(label => categoryTotals[label].total);
    const backgroundColor = labels.map(label => categoryTotals[label].color);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  // Monthly spending trend
  const getMonthlyTrendData = () => {
    const monthlyTotals = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = 0;
      }
      monthlyTotals[monthKey] += expense.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    const labels = sortedMonths.map(month => format(new Date(month), 'MMM yyyy'));
    const data = sortedMonths.map(month => monthlyTotals[month]);

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Spending',
          data,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f650',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Daily spending for current month
  const getDailySpendingData = () => {
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dailyTotals = {};
    daysInMonth.forEach(day => {
      dailyTotals[format(day, 'yyyy-MM-dd')] = 0;
    });

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayKey = format(expenseDate, 'yyyy-MM-dd');
      
      if (dailyTotals.hasOwnProperty(dayKey)) {
        dailyTotals[dayKey] += expense.amount;
      }
    });

    const labels = daysInMonth.map(day => format(day, 'd'));
    const data = daysInMonth.map(day => dailyTotals[format(day, 'yyyy-MM-dd')]);

    return {
      labels,
      datasets: [
        {
          label: 'Daily Spending',
          data,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (expenses.length === 0) {
    return (
      <div className="charts-container">
        <div className="chart-placeholder">
          <p>No data available for charts. Add some expenses to see analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Expenses by Category</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Doughnut data={getCategoryChartData()} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Monthly Spending Trend</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Line data={getMonthlyTrendData()} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card chart-card-full">
          <h3>Daily Spending - {format(new Date(), 'MMMM yyyy')}</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={getDailySpendingData()} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;