import React, { useState, useEffect, useCallback } from 'react';
import { categoriesService } from '../services/categories';

const CategoryManager = ({ onCategoryUpdate, initialCategories = [] }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [initialLoad, setInitialLoad] = useState(initialCategories.length > 0);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#3b82f6',
    description: '',
    icon: '💰'
  });

  const defaultIcons = [
    '💰', '🏠', '🍽️', '🚗', '⛽', '🛍️', '💊', '🎓', 
    '🎮', '📱', '✈️', '🎬', '👕', '📚', '🏋️', '☕'
  ];

  const loadCategories = useCallback(async (forceLoad = false) => {
    if (initialLoad && !forceLoad) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await categoriesService.getAll();
      
      if (result.success) {
        setCategories(result.data);
        if (onCategoryUpdate) {
          onCategoryUpdate(result.data);
        }
        setInitialLoad(true);
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onCategoryUpdate, initialLoad]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (initialCategories.length > 0 && !initialLoad) {
      setCategories(initialCategories);
      setInitialLoad(true);
    }
  }, [initialCategories, initialLoad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      let result;
      
      if (editingCategory) {
        // Update existing category
        result = await categoriesService.update(editingCategory.id, categoryForm);
      } else {
        // Create new category
        result = await categoriesService.create(categoryForm);
      }
      
      if (result.success) {
        setCategoryForm({
          name: '',
          color: '#3b82f6',
          description: '',
          icon: '💰'
        });
        setShowAddCategory(false);
        setEditingCategory(null);
        loadCategories(true);
      } else {
        setError(result.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      setError('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
      description: category.description || '',
      icon: category.icon || '💰'
    });
    setShowAddCategory(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated expenses will be updated to "Unknown" category.')) {
      return;
    }

    try {
      const result = await categoriesService.delete(categoryId);
      
      if (result.success) {
        loadCategories(true);
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleCancel = () => {
    setCategoryForm({
      name: '',
      color: '#3b82f6',
      description: '',
      icon: '💰'
    });
    setShowAddCategory(false);
    setEditingCategory(null);
    setError('');
  };

  const getCategoryStats = (categoryId) => {
    // This would normally come from a service call
    // For now, return mock data
    return {
      totalExpenses: Math.floor(Math.random() * 1000),
      expenseCount: Math.floor(Math.random() * 50)
    };
  };

  if (loading && !initialLoad) {
    return (
      <div className="category-manager">
        <div className="loading-container">
          <div className="loading-spinner">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager">
      {loading && initialLoad && (
        <div className="loading-overlay">
          <div className="loading-spinner">Updating...</div>
        </div>
      )}
      
      <div className="category-header">
        <h3>Manage Categories</h3>
        <button 
          onClick={() => setShowAddCategory(true)}
          className="btn btn-primary"
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Add/Edit Category Form */}
      {showAddCategory && (
        <div className="category-form-card">
          <h4>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Category Name: *</label>
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
                <div className="color-input-group">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                    className="color-input"
                  />
                  <div 
                    className="color-preview"
                    style={{ backgroundColor: categoryForm.color }}
                  ></div>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label>Description:</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Icon:</label>
              <div className="icon-selector">
                {defaultIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${categoryForm.icon === icon ? 'selected' : ''}`}
                    onClick={() => setCategoryForm({...categoryForm, icon})}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories yet. Create your first category to get started!</p>
          </div>
        ) : (
          categories.map(category => {
            const stats = getCategoryStats(category.id);
            return (
              <div key={category.id} className="category-card">
                <div className="category-card-header">
                  <div className="category-info">
                    <div className="category-icon-display">
                      {category.icon || '💰'}
                    </div>
                    <div className="category-details">
                      <h4>{category.name}</h4>
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="category-actions">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="btn btn-sm btn-outline"
                      title="Edit category"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="category-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Spent:</span>
                    <span className="stat-value">${stats.totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Transactions:</span>
                    <span className="stat-value">{stats.expenseCount}</span>
                  </div>
                </div>

                <div className="category-color-bar">
                  <div 
                    className="color-indicator"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Import/Export */}
      <div className="category-tools">
        <h4>Category Tools</h4>
        <div className="tool-buttons">
          <button 
            onClick={() => {
              const categoryData = JSON.stringify(categories, null, 2);
              const blob = new Blob([categoryData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'categories_backup.json';
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="btn btn-outline"
          >
            Export Categories
          </button>
          <button 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const importedCategories = JSON.parse(e.target.result);
                      console.log('Imported categories:', importedCategories);
                      // Here you would implement the import logic
                      alert('Import functionality coming soon!');
                    } catch (error) {
                      setError('Invalid JSON file');
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="btn btn-outline"
          >
            Import Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;