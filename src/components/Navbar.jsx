import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-minimal sticky-top py-2 bg-white">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            <i className="bi bi-compass fs-6"></i>
          </div>
          <span className="fw-semibold">Campus Lost & Found</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-1 ms-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/items">
                Browse Items
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/report-lost">
                    <span className="text-danger-emphasis">Lost an Item</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/report-found">
                    <span className="text-success-emphasis">Found an Item</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Normal User Dropdown */}
            {isAuthenticated && !isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  My Activity
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1">
                  <li>
                    <Link className="dropdown-item py-2" to="/user/dashboard">
                      <i className="bi bi-grid me-2 text-muted"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/user/my-reports">
                      <i className="bi bi-journal-text me-2 text-muted"></i> My Reports
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/user/my-claims">
                      <i className="bi bi-clipboard-check me-2 text-muted"></i> My Claims
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Admin Menu */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-dark fw-semibold"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin Desk
                </a>
                <ul className="dropdown-menu shadow-sm border-0 rounded-3 mt-1">
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/dashboard">
                      <i className="bi bi-bar-chart me-2 text-muted"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/items">
                      <i className="bi bi-boxes me-2 text-muted"></i> Manage Items
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/claims">
                      <i className="bi bi-clipboard-pulse me-2 text-muted"></i> Review Claims
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/users">
                      <i className="bi bi-people me-2 text-muted"></i> Users
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* User Account / Auth Actions */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-light border-0 d-flex align-items-center gap-2 py-1 px-3 rounded-pill bg-light"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="small fw-medium text-dark text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.fullName}
                  </span>
                  {isAdmin && <span className="badge bg-dark-subtle text-dark ms-1" style={{ fontSize: '0.65rem' }}>Admin</span>}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1">
                  <li className="px-3 py-2 border-bottom">
                    <div className="small fw-semibold text-dark">{user?.fullName}</div>
                    <div className="small text-muted">{user?.email}</div>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-gear me-2 text-muted"></i> Settings
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}>
                      <i className="bi bi-columns me-2 text-muted"></i> Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-light border-0 px-3 rounded-pill text-dark">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-sm btn-dark px-3 rounded-pill">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
