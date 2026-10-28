import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-minimal py-4 mt-auto">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <i className="bi bi-compass text-dark"></i>
              <span className="fw-semibold text-dark">Campus Lost & Found</span>
            </div>
            <p className="small text-muted mb-0">
              Connecting students and staff with misplaced belongings across campus.
            </p>
          </div>

          <div className="col-12 col-md-6 text-center text-md-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-3 small">
              <Link to="/">Home</Link>
              <Link to="/items">Items</Link>
              <Link to="/report-lost">Report Lost</Link>
              <Link to="/report-found">Report Found</Link>
              <span className="text-muted">&bull;</span>
              <span className="text-muted">Student Union 104</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
