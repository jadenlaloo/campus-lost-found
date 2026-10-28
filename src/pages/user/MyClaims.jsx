import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimService } from '../../services/api';
import { useInspector } from '../../context/InspectorContext';

export default function MyClaims() {
  const { setSelectedItem } = useInspector();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await claimService.getMyClaims();
        if (res.data.success) {
          setClaims(res.data.claims || []);
        }
      } catch (err) {
        console.error('Failed to load user claims:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="main-column">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
        <div>
          <h4 className="fw-bold text-dark mb-0">Claims: My Status</h4>
          <span className="small text-muted font-monospace">Track ownership verification and collection</span>
        </div>

        <Link to="/items?reportType=found" className="btn btn-sm btn-outline-dark">
          Browse Found Registry
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="p-4 bg-white border border-dark rounded text-center text-muted small">
          You haven't submitted any ownership claims yet.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {claims.map((claim) => {
            const isApproved = claim.status === 'approved';

            return (
              <div
                key={claim._id}
                className="p-3 bg-white border border-dark rounded shadow-xs"
                onClick={() => claim.item && setSelectedItem(claim.item)}
              >
                <div className="row g-3 align-items-start">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge ${isApproved ? 'bg-success text-white' : claim.status === 'rejected' ? 'bg-danger text-white' : 'bg-warning text-dark'}`} style={{ border: '1px solid #000', fontSize: '0.65rem' }}>
                        {claim.status.toUpperCase()}
                      </span>
                      <span className="small text-muted font-monospace">
                        Submitted {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1">
                      {claim.item ? claim.item.itemName : 'Item Record'}
                    </h6>

                    {claim.item && (
                      <div className="small text-muted font-monospace mb-2">
                        Location: {claim.item.campusLocation}
                      </div>
                    )}

                    <div className="p-2 bg-light border border-dark rounded small text-muted mb-2">
                      <span className="fw-bold text-dark d-block">Your Explanation:</span>
                      <div>{claim.claimExplanation}</div>
                    </div>

                    {claim.decisionNote && (
                      <div className="p-2 bg-light border border-dark rounded small">
                        <span className="fw-bold text-dark d-block">Staff Decision Note:</span>
                        <div className="fst-italic text-secondary">"{claim.decisionNote}"</div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    {isApproved ? (
                      <div className="p-3 bg-light border border-success rounded text-success-emphasis small">
                        <span className="fw-bold d-block mb-1">
                          <i className="bi bi-check-circle-fill me-1"></i> Ready for Collection
                        </span>
                        <p className="small mb-1">Bring your student/staff ID to:</p>
                        <div className="fw-bold text-dark">Student Union Room 104</div>
                        <div className="small text-muted font-monospace">8:00 AM – 6:00 PM</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-light border border-dark rounded small text-muted">
                        <span className="fw-bold text-dark d-block mb-1">
                          {claim.status === 'rejected' ? 'Claim Rejected' : 'Under Review'}
                        </span>
                        <span>
                          {claim.status === 'rejected'
                            ? 'Submitted proof did not match physical item inspection.'
                            : 'Administration is auditing your private proof details.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
