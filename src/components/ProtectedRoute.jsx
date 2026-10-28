import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-danger border-2 text-center p-4">
              <div className="text-danger mb-3">
                <i className="bi bi-shield-slash-fill fs-1"></i>
              </div>
              <h4 className="fw-bold text-danger">Access Restricted</h4>
              <p className="text-muted">
                You do not have administrative privileges to access this page. Please return to your student dashboard.
              </p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <a href="/user/dashboard" className="btn btn-primary">
                  Go to User Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
