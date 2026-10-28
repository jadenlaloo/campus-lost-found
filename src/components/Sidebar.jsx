import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="nav-sidebar">
      {/* Flame / Beacon Brand Icon */}
      <Link to="/" className="brand-logo text-decoration-none" title="Campus Lost & Found">
        <i className="bi bi-fire"></i>
      </Link>

      {/* Main Navigation Stack */}
      <NavLink
        to="/"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        title="Home"
      >
        <i className="bi bi-house-door-fill"></i>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/items"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        title="Browse Items"
      >
        <i className="bi bi-grid-fill"></i>
        <span>Category</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/user/my-reports' : '/login'}
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        title="My Reports"
      >
        <i className="bi bi-journal-bookmark-fill"></i>
        <span>Library</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/user/my-claims' : '/login'}
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        title="My Claims"
      >
        <i className="bi bi-download"></i>
        <span>Claims</span>
      </NavLink>

      <NavLink
        to="/report-lost"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        title="Report Lost Item"
      >
        <i className="bi bi-bookmark-fill"></i>
        <span>Saved</span>
      </NavLink>

      {/* Bottom Stack: Admin, Settings, Support, Auth */}
      <div className="sidebar-bottom">
        {isAdmin && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title="Admin Dashboard"
          >
            <i className="bi bi-shield-lock-fill text-warning"></i>
            <span>Admin</span>
          </NavLink>
        )}

        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="Account Settings"
        >
          <i className="bi bi-gear-fill"></i>
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="Campus Support & Help Desk"
        >
          <i className="bi bi-headset"></i>
          <span>Support</span>
        </NavLink>

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="sidebar-nav-item border-0 bg-transparent"
            title="Sign Out"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title="Sign In"
          >
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
