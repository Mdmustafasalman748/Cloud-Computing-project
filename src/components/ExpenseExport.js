import React, { useState } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExpenseExport = ({ expenses, categories, filteredExpenses }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportData, setExportData] = useState('filtered'); // 'all' or 'filtered'

  const getExportData = () => {
    return exportData === 'filtered' ? filteredExpenses : expenses;
  };

  const exportToCSV = () => {
    const data = getExportData();
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...data.map(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        return [
          format(new Date(expense.date), 'yyyy-MM-dd'),
          `"${expense.description}"`,
          `"${category?.name || 'Unknown'}"`,
          expense.amount.toFixed(2),
          expense.currency
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const data = getExportData();
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Expense Report', 14, 22);
    
    // Add generation date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 32);
    
    // Calculate totals
    const totalAmount = data.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = {};
    
    data.forEach(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category?.name || 'Unknown';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += expense.amount;
    });

    // Add summary
    pdf.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 14, 42);
    pdf.text(`Number of Transactions: ${data.length}`, 14, 52);

    // Add category breakdown
    let yPosition = 65;
    pdf.text('Category Breakdown:', 14, yPosition);
    yPosition += 10;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      const percentage = ((amount / totalAmount) * 100).toFixed(1);
      pdf.text(`  ${category}: $${amount.toFixed(2)} (${percentage}%)`, 20, yPosition);
      yPosition += 8;
    });

    // Add expense table
    yPosition += 10;
    const tableHeaders = ['Date', 'Description', 'Category', 'Amount', 'Currency'];
    const tableData = data.map(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      return [
        format(new Date(expense.date), 'yyyy-MM-dd'),
        expense.description,
        category?.name || 'Unknown',
        `$${expense.amount.toFixed(2)}`,
        expense.currency
      ];
    });

    autoTable(pdf, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Save the PDF
    pdf.save(`expense_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToJSON = () => {
    const data = getExportData();
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const exportObj = {
      exportDate: new Date().toISOString(),
      totalExpenses: data.reduce((sum, expense) => sum + expense.amount, 0),
      transactionCount: data.length,
      expenses: data.map(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        return {
          ...expense,
          categoryName: category?.name || 'Unknown',
          categoryColor: category?.color || '#gray'
        };
      }),
      categories: categories
    };

    const jsonContent = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'json':
        exportToJSON();
        break;
      default:
        alert('Please select an export format');
    }
  };

  const getDataSummary = () => {
    const data = getExportData();
    const total = data.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      count: data.length,
      total: total.toFixed(2)
    };
  };

  const summary = getDataSummary();

  return (
    <div className="expense-export">
      <div className="export-header">
        <h3>Export Expenses</h3>
      </div>

      <div className="export-options">
        <div className="export-grid">
          <div className="export-group">
            <label>Export Format:</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV (Excel compatible)</option>
              <option value="pdf">PDF Report</option>
              <option value="json">JSON (with metadata)</option>
            </select>
          </div>

          <div className="export-group">
            <label>Data to Export:</label>
            <select
              value={exportData}
              onChange={(e) => setExportData(e.target.value)}
            >
              <option value="filtered">Filtered Results ({filteredExpenses.length} items)</option>
              <option value="all">All Expenses ({expenses.length} items)</option>
            </select>
          </div>
        </div>

        <div className="export-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Items to Export:</span>
              <span className="stat-value">{summary.count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Amount:</span>
              <span className="stat-value">${summary.total}</span>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button 
            onClick={handleExport}
            className="btn btn-primary"
            disabled={summary.count === 0}
          >
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="export-info">
        <h4>Export Formats:</h4>
        <ul>
          <li><strong>CSV:</strong> Spreadsheet format, compatible with Excel and Google Sheets</li>
          <li><strong>PDF:</strong> Formatted report with summary and detailed transaction list</li>
          <li><strong>JSON:</strong> Complete data export including metadata and category information</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpenseExport;