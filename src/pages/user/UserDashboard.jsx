import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/api';
import { useInspector } from '../../context/InspectorContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const { setSelectedItem } = useInspector();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getUserStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load user dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="main-column text-center py-5">
        <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const myRecentItems = data?.myRecentItems || [];
  const myRecentClaims = data?.myRecentClaims || [];

  return (
    <div className="main-column">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark">
        <div>
          <h4 className="fw-bold text-dark mb-0">Welcome, {user?.fullName}</h4>
          <span className="small text-muted font-monospace">{user?.email} &bull; {user?.department || 'Member'}</span>
        </div>

        <div className="d-flex gap-2">
          <Link to="/report-lost" className="btn btn-sm btn-outline-dark fw-bold">
            + Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-sm btn-dark text-warning fw-bold">
            + Report Found
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border border-dark rounded shadow-xs">
            <span className="small text-muted font-monospace d-block">Lost Reports</span>
            <div className="h3 fw-bold text-dark mb-0">{stats.myLostItemsCount || 0}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border border-dark rounded shadow-xs">
            <span className="small text-muted font-monospace d-block">Found Items</span>
            <div className="h3 fw-bold text-dark mb-0">{stats.myFoundItemsCount || 0}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border border-dark rounded shadow-xs">
            <span className="small text-muted font-monospace d-block">Pending Claims</span>
            <div className="h3 fw-bold text-dark mb-0">{stats.myClaims?.pending || 0}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border border-dark rounded shadow-xs">
            <span className="small text-muted font-monospace d-block">Approved Claims</span>
            <div className="h3 fw-bold text-dark mb-0">{stats.myClaims?.approved || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="row g-4">
        {/* Left: My Recent Reports */}
        <div className="col-md-7">
          <div className="p-3 bg-white border border-dark rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark small text-uppercase">
                My Recent Reports
              </h6>
              <Link to="/user/my-reports" className="small text-dark text-decoration-underline font-monospace">
                View All
              </Link>
            </div>

            {myRecentItems.length === 0 ? (
              <div className="text-center py-4 text-muted small font-monospace">
                No reports submitted yet.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {myRecentItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-2 bg-light border border-dark rounded d-flex justify-content-between align-items-center cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${item.reportType === 'lost' ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ border: '1px solid #000', fontSize: '0.65rem' }}>
                          {item.reportType.toUpperCase()}
                        </span>
                        <span className="small fw-bold text-dark">{item.itemName}</span>
                      </div>
                      <div className="small text-muted font-monospace">
                        {item.campusLocation} &bull; {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge bg-white text-dark border border-dark small">{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: My Claims */}
        <div className="col-md-5">
          <div className="p-3 bg-white border border-dark rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark small text-uppercase">
                Claim Status
              </h6>
              <Link to="/user/my-claims" className="small text-dark text-decoration-underline font-monospace">
                View All
              </Link>
            </div>

            {myRecentClaims.length === 0 ? (
              <div className="text-center py-4 text-muted small font-monospace">
                No active claims.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {myRecentClaims.map((claim) => (
                  <div key={claim._id} className="p-2 bg-light border border-dark rounded small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark text-truncate">{claim.item?.itemName}</span>
                      <span className="badge bg-dark text-white text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {claim.status}
                      </span>
                    </div>
                    {claim.decisionNote && (
                      <div className="text-muted fst-italic font-monospace" style={{ fontSize: '0.72rem' }}>
                        "{claim.decisionNote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
