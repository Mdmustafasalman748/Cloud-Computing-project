import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className={`modern-header ${isScrolled ? 'scrolled' : ''} ${isHomePage ? 'transparent' : 'solid'}`}>
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <div className="logo-gradient">ET</div>
            </div>
            <span className="logo-text">ExpenseTracker Pro</span>
          </Link>
        </div>

        {/* Desktop Navigation - Always visible */}
        <nav className="desktop-nav">
          {isAuthenticated ? (
            // Authenticated user navigation
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/analytics" className="nav-link">
                Analytics
              </Link>
              
              <div className="user-profile">
                <div className="user-avatar">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-greeting">
                    {user?.fullName || 'User'}
                  </span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Non-authenticated user navigation
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="cta-nav-button">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="mobile-user-name">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="mobile-user-email">{user?.email}</div>
                </div>
              </div>
              
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/analytics" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Analytics
              </Link>
              
              <button onClick={handleLogout} className="mobile-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="mobile-cta-button" onClick={() => setIsMobileMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;