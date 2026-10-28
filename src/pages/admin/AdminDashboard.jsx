import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const res = await dashboardService.getAdminStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentItems = data?.recentItems || [];
  const recentClaims = data?.recentClaims || [];

  return (
    <div className="main-column p-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-dark">
        <div>
          <span className="badge bg-warning text-dark border border-dark mb-2 px-2 py-1 font-monospace">Campus Administration</span>
          <h3 className="fw-bold text-dark mb-1">Campus Command & Overview</h3>
          <p className="text-muted small mb-0 font-monospace">Real-time status across lost reports, inventory custody, and claims</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/items" className="btn btn-sm btn-outline-dark fw-bold">
            <i className="bi bi-boxes me-1"></i> Inventory
          </Link>
          <Link to="/admin/claims" className="btn btn-sm btn-dark fw-bold">
            <i className="bi bi-clipboard-check me-1"></i> Claims ({stats.totalPendingClaims || 0})
          </Link>
          <Link to="/admin/users" className="btn btn-sm btn-outline-dark fw-bold">
            <i className="bi bi-people me-1"></i> Users
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg">
          <div className="bg-white border border-dark rounded p-3 shadow-sm h-100">
            <span className="small text-muted font-monospace text-uppercase d-block">Registered Users</span>
            <div className="h3 fw-bold text-dark mb-1">{stats.totalUsers || 0}</div>
            <Link to="/admin/users" className="small text-dark fw-bold text-decoration-none">
              User Directory &rarr;
            </Link>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div className="bg-white border border-dark rounded p-3 shadow-sm h-100">
            <span className="small text-muted font-monospace text-uppercase d-block">Lost Reports</span>
            <div className="h3 fw-bold text-danger mb-1">{stats.totalLostItems || 0}</div>
            <Link to="/admin/items?reportType=lost" className="small text-dark fw-bold text-decoration-none">
              Lost items &rarr;
            </Link>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div className="bg-white border border-dark rounded p-3 shadow-sm h-100">
            <span className="small text-muted font-monospace text-uppercase d-block">Found In Custody</span>
            <div className="h3 fw-bold text-success mb-1">{stats.totalFoundItems || 0}</div>
            <Link to="/admin/items?reportType=found" className="small text-dark fw-bold text-decoration-none">
              Found items &rarr;
            </Link>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div className="bg-white border border-dark rounded p-3 shadow-sm h-100" style={{ borderLeft: '4px solid var(--orange-accent)' }}>
            <span className="small text-muted font-monospace text-uppercase d-block">Pending Claims</span>
            <div className="h3 fw-bold mb-1" style={{ color: 'var(--orange-accent)' }}>{stats.totalPendingClaims || 0}</div>
            <Link to="/admin/claims?status=pending" className="small text-dark fw-bold text-decoration-none">
              Review queue &rarr;
            </Link>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div className="bg-white border border-dark rounded p-3 shadow-sm h-100">
            <span className="small text-muted font-monospace text-uppercase d-block">Reunited</span>
            <div className="h3 fw-bold text-primary mb-1">{stats.totalResolvedItems || 0}</div>
            <Link to="/admin/items?status=returned" className="small text-dark fw-bold text-decoration-none">
              Returned &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Streams */}
      <div className="row g-4">
        {/* Left: Recent Items */}
        <div className="col-lg-6">
          <div className="bg-white border border-dark rounded shadow-sm overflow-hidden h-100">
            <div className="p-3 border-bottom border-dark d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff9d6' }}>
              <h6 className="fw-bold mb-0 text-dark small text-uppercase font-monospace">
                Recent Campus Reports
              </h6>
              <Link to="/admin/items" className="small text-dark fw-bold text-decoration-none font-monospace">
                All Inventory &rarr;
              </Link>
            </div>

            <div className="p-3">
              {recentItems.length === 0 ? (
                <p className="text-muted small">No items registered.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {recentItems.map((item) => (
                    <div key={item._id} className="p-3 bg-light border border-dark rounded d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className={`badge ${item.reportType === 'lost' ? 'bg-danger text-white' : 'bg-success text-white'} border border-dark font-monospace text-uppercase small`}>
                            {item.reportType}
                          </span>
                          <span className="small fw-bold text-dark">{item.itemName}</span>
                        </div>
                        <div className="small text-muted font-monospace">
                          {item.campusLocation} &bull; {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge bg-white text-dark border border-dark font-monospace text-capitalize">{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Claims */}
        <div className="col-lg-6">
          <div className="bg-white border border-dark rounded shadow-sm overflow-hidden h-100">
            <div className="p-3 border-bottom border-dark d-flex justify-content-between align-items-center" style={{ backgroundColor: '#fff9d6' }}>
              <h6 className="fw-bold mb-0 text-dark small text-uppercase font-monospace">
                Pending Claim Submissions
              </h6>
              <Link to="/admin/claims" className="small text-dark fw-bold text-decoration-none font-monospace">
                Verification Queue &rarr;
              </Link>
            </div>

            <div className="p-3">
              {recentClaims.length === 0 ? (
                <p className="text-muted small">No claims submitted.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {recentClaims.map((claim) => (
                    <div key={claim._id} className="p-3 bg-light border border-dark rounded d-flex justify-content-between align-items-center">
                      <div>
                        <div className="small fw-bold text-dark mb-1">
                          {claim.item?.itemName}
                        </div>
                        <div className="small text-muted font-monospace">
                          By {claim.claimant?.fullName} &bull; {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`badge ${
                        claim.status === 'approved'
                          ? 'bg-success text-white'
                          : claim.status === 'rejected'
                          ? 'bg-danger text-white'
                          : 'bg-warning text-dark'
                      } border border-dark font-monospace text-capitalize`}>
                        {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
