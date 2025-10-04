import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { CSSTransition } from 'react-transition-group';
import {
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  Film,
  Home,
  Menu,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const nodeRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar new-styles">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <Film size={24} />
            <span>MovieRec</span>
          </Link>
        </div>

        {user && (
          <div className="navbar-center hidden md:flex">
            <NavLink to={isAdmin() ? "/admin" : "/user"} className="nav-link">
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>
          </div>
        )}

        <div className="navbar-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 rounded-md text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Menu size={24} />
              </button>
              <CSSTransition
                in={isDropdownOpen}
                timeout={200}
                classNames="dropdown"
                unmountOnExit
                nodeRef={nodeRef}
              >
                <div ref={nodeRef} className="dropdown-menu absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-primary truncate">{user.username}</p>
                    <p className="text-xs text-secondary">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <NavLink to={isAdmin() ? "/admin" : "/user"} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <LayoutDashboard size={16} className="mr-3" />
                      Dashboard
                    </NavLink>
                    {isAdmin() && (
                      <NavLink to="/admin/users" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <Users size={16} className="mr-3" />
                        User Management
                      </NavLink>
                    )}
                  </div>
                  <div className="py-1 border-t border-border">
                    <button onClick={handleLogout} className="dropdown-item text-red-500">
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </CSSTransition>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
