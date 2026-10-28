import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInspector } from '../context/InspectorContext';

export default function TopHeader() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { searchQuery, setSearchQuery } = useInspector();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  // Determine user dashboard destination based on role
  const dashboardPath = isAdmin ? '/admin' : '/user/dashboard';

  return (
    <header className="top-header-bar">
      {/* Left Yellow Search Bar */}
      <div className="top-header-left">
        <form onSubmit={handleSearchSubmit} className="w-100">
          <div className="search-box-editorial">
            <i className="bi bi-search me-2 text-dark"></i>
            <input
              type="text"
              placeholder="Title, category, building, or keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Right User & Notification Bar */}
      <div className="top-header-right">
        {isAuthenticated ? (
          <Link
            to={dashboardPath}
            className="user-widget-editorial"
            title="Go to My Dashboard"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="user-avatar-editorial">
              {user?.fullName ? (
                <span className="fw-bold small">{user.fullName.charAt(0)}</span>
              ) : (
                <i className="bi bi-person-fill"></i>
              )}
            </div>
            <div className="text-start">
              <div className="fw-bold small text-dark lh-sm text-truncate" style={{ maxWidth: '140px' }}>
                {user?.fullName || 'Bruce Wayne'}
              </div>
              <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                {isAdmin ? 'Campus Admin' : (user?.department || 'Student Member')}
              </div>
            </div>
            <i className="bi bi-caret-down-fill text-muted ms-1" style={{ fontSize: '0.65rem' }}></i>
          </Link>
        ) : (
          <Link to="/login" className="user-widget-editorial">
            <div className="user-avatar-editorial">
              <i className="bi bi-person"></i>
            </div>
            <div>
              <div className="fw-bold small text-dark lh-sm">Guest Visitor</div>
              <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Click to Sign In</div>
            </div>
          </Link>
        )}

        {/* Notification Bell Button in Bordered Square */}
        <Link
          to={isAuthenticated ? '/user/my-claims' : '/login'}
          className="notification-btn-editorial"
          title="Notifications & Claims"
        >
          <i className="bi bi-bell"></i>
        </Link>
      </div>
    </header>
  );
}