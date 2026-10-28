import React, { useEffect, useState } from 'react';
import { itemService } from '../services/api';
import { Link } from 'react-router-dom';

export default function MatchSuggestionsModal({ item, onClose, onOpenClaim }) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item?._id) return;

    const fetchMatches = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await itemService.getMatches(item._id);
        if (res.data.success) {
          setMatches(res.data.matches || []);
        }
      } catch (err) {
        console.error('Failed to get match suggestions:', err);
        setError('Could not calculate matching reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [item?._id]);

  if (!item) return null;

  const isLost = item.reportType === 'lost';

  return (
    <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content modal-content-editorial">
          <div className="modal-header modal-header-editorial">
            <h6 className="modal-title fw-bold text-dark mb-0">
              <i className="bi bi-shuffle me-1"></i> Potential Matches for "{item.itemName}"
            </h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 small text-muted border-bottom pb-2">
              <span>
                Looking for opposing {isLost ? 'found items' : 'lost reports'} in <strong>{item.category}</strong>
              </span>
              <span className="badge bg-dark text-white">{item.campusLocation}</span>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
                <div className="small text-muted mt-2">Cross-referencing registry...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger py-2 small">{error}</div>
            ) : matches.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <p className="mb-0">No matching opposing reports found at this time.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {matches.map((match) => (
                  <div key={match._id} className="p-3 bg-light border border-dark rounded">
                    <div className="row g-3 align-items-center">
                      <div className="col-auto">
                        {match.imageUrl ? (
                          <img
                            src={match.imageUrl}
                            alt=""
                            className="rounded object-fit-cover border border-dark"
                            style={{ width: '48px', height: '48px' }}
                          />
                        ) : (
                          <div className="bg-white rounded border border-dark d-flex align-items-center justify-content-center text-muted" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-box-seam"></i>
                          </div>
                        )}
                      </div>

                      <div className="col">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className={`badge ${match.reportType === 'lost' ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ border: '1px solid #000' }}>
                            {match.reportType.toUpperCase()}
                          </span>
                          <span className="badge bg-white text-dark border border-dark">{match.matchScore}% match</span>
                          <span className="small fw-bold text-dark">{match.itemName}</span>
                        </div>

                        <div className="small text-muted font-monospace mb-1">
                          {match.campusLocation} &bull; {new Date(match.dateLostOrFound).toLocaleDateString()}
                        </div>

                        {match.matchReasons && (
                          <div className="d-flex flex-wrap gap-1">
                            {match.matchReasons.map((r, i) => (
                              <span key={i} className="badge bg-white text-muted border border-secondary" style={{ fontSize: '0.7rem' }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="col-auto d-flex gap-2">
                        <Link
                          to={`/items/${match._id}`}
                          className="btn btn-sm btn-outline-dark"
                          onClick={onClose}
                        >
                          Details
                        </Link>
                        {isLost && match.reportType === 'found' && match.status !== 'returned' && onOpenClaim && (
                          <button
                            className="btn btn-sm btn-dark text-warning"
                            onClick={() => {
                              onClose();
                              onOpenClaim(match);
                            }}
                          >
                            Claim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-top border-dark py-2 px-4 bg-light">
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
