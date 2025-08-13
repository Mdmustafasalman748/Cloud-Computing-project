// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section-clean">
        <div className="hero-container">
          <div className="hero-content-clean">
            <div className="hero-text">
              <h1 className="hero-title-clean">
                Free Online ExpenseTracker Pro
              </h1>
              <p className="hero-subtitle-clean">
                Take control of your spending with our intelligent expense tracking platform. 
                Monitor spending, categorize expenses, and achieve your financial goals effortlessly.
              </p>

              {isAuthenticated ? (
                <div className="hero-cta">
                  <Link to="/dashboard" className="btn-primary-large">
                    Go to Dashboard
                  </Link>
                  <p className="hero-note">
                    Welcome back, {user?.fullName?.split(' ')[0]}!
                  </p>
                </div>
              ) : (
                <div className="hero-cta">
                  <div>
                    <Link to="/register" className="btn-primary-large">
                      Start Tracking for Free
                    </Link>
                    <Link to="/login" className="btn-secondary-large">
                      Sign In
                    </Link>
                  </div>
                  <p className="hero-note">No credit card required • Always free</p>
                </div>
              )}
            </div>

            <div className="hero-image">
              <div className="mockup-container">
                <div className="mockup-screen">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="mockup-title">ExpenseTracker Pro</div>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-stat">
                      <span className="stat-label">Total Expenses</span>
                      <span className="stat-value">$2,847.50</span>
                    </div>
                    <div className="mockup-chart">
                      <div className="chart-bar" style={{ height: '60%', backgroundColor: '#10b981' }}></div>
                      <div className="chart-bar" style={{ height: '80%', backgroundColor: '#3b82f6' }}></div>
                      <div className="chart-bar" style={{ height: '45%', backgroundColor: '#f59e0b' }}></div>
                      <div className="chart-bar" style={{ height: '70%', backgroundColor: '#ef4444' }}></div>
                    </div>
                    <div className="mockup-categories">
                      <div className="category-item">
                        <div className="category-dot" style={{ backgroundColor: '#10b981' }}></div>
                        <span>Food & Dining</span>
                        <span>$845</span>
                      </div>
                      <div className="category-item">
                        <div className="category-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                        <span>Transportation</span>
                        <span>$520</span>
                      </div>
                      <div className="category-item">
                        <div className="category-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                        <span>Shopping</span>
                        <span>$380</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section-clean">
        <div className="container">
          <div className="section-header-clean">
            <h2>Why Choose ExpenseTracker Pro?</h2>
            <p>Discover powerful tools to manage your finances effectively</p>
          </div>

          <div className="features-grid-clean">
            {/* Feature Card 1 */}
            <div className="feature-card-clean">
              <div className="feature-icon-clean">
                <svg width="48" height="48" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3>Smart Categorization</h3>
              <p>Automatically categorize your expenses with intelligent suggestions and custom categories for better organization.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card-clean">
              <div className="feature-icon-clean">
                <svg width="48" height="48" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H1v12h8V11zM23 11h-8v12h8V11z"></path>
                  <path d="M15 3h-6v8h6V3z"></path>
                </svg>
              </div>
              <h3>Detailed Analytics</h3>
              <p>Get insights into your spending patterns with comprehensive charts and reports to understand your financial habits.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card-clean">
              <div className="feature-icon-clean">
                <svg width="48" height="48" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Budget Goals</h3>
              <p>Set spending limits and get alerts when you're approaching your budget limits to stay on track financially.</p>
            </div>

            {/* More feature cards... */}
            {/* Add the rest here or keep your original structure if unchanged */}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="container">
          <div className="section-header-clean">
            <h2>How ExpenseTracker Pro Works</h2>
            <p>Get started in three simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up for ExpenseTracker Pro in under 30 seconds. No credit card required to get started.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Add Your Expenses</h3>
              <p>Easily add expenses and categorize them. Set up your budget limits and financial goals.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Track & Analyze</h3>
              <p>View detailed reports, track spending patterns, and achieve your financial goals with ExpenseTracker Pro.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      {!isAuthenticated && (
        <div className="cta-section-clean">
          <div className="container">
            <div className="cta-content-clean">
              <h2>Ready to Transform Your Financial Health with ExpenseTracker Pro?</h2>
              <p>Join thousands of users who have improved their financial management with ExpenseTracker Pro.</p>
              <div className="cta-buttons-clean">
                <Link to="/register" className="btn-primary-large">
                  Start Using ExpenseTracker Pro
                </Link>
                <Link to="/login" className="btn-secondary-large">
                  Sign In to ExpenseTracker Pro
                </Link>
              </div>
              <p className="cta-note-clean">
                ✓ No credit card required  ✓ Always free  ✓ Secure & private
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
