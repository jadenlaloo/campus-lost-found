import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { claimService } from '../../services/api';

export default function AdminClaims() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

  const [inspectingClaim, setInspectingClaim] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [decisionNote, setDecisionNote] = useState('');
  const [markItemReturned, setMarkItemReturned] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await claimService.getAdminClaims(params);
      if (res.data.success) {
        setClaims(res.data.claims || []);
      }
    } catch (err) {
      console.error('Failed to load admin claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setSearchParams(val !== 'All' ? { status: val } : {});
  };

  const openReviewModal = (claim, defaultAction) => {
    setInspectingClaim(claim);
    setReviewAction(defaultAction);
    setDecisionNote(
      defaultAction === 'approved'
        ? 'Ownership verified against physical item characteristics. Approved for collection.'
        : 'Identifying marks provided did not match item physical inspection.'
    );
    setMarkItemReturned(true);
    setErrorMessage('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewing(true);
    setErrorMessage('');

    try {
      const res = await claimService.reviewClaim(inspectingClaim._id, {
        status: reviewAction,
        decisionNote,
        markItemReturned: reviewAction === 'approved' ? markItemReturned : false,
      });

      if (res.data.success) {
        setToastMessage(`Claim marked as ${reviewAction}.`);
        setInspectingClaim(null);
        fetchClaims();
      }
    } catch (err) {
      console.error('Review claim error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to review claim.');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="main-column p-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-dark border border-dark shadow rounded-3 font-monospace" style={{ backgroundColor: 'var(--yellow-accent)' }} role="alert">
            <div className="d-flex">
              <div className="toast-body small fw-bold">
                <i className="bi bi-check-circle me-2"></i> {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close me-2 m-auto"
                onClick={() => setToastMessage('')}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-dark">
        <div>
          <span className="badge bg-warning text-dark border border-dark mb-2 px-2 py-1 font-monospace">Adjudication</span>
          <h3 className="fw-bold text-dark mb-1">Claim Verification Queue</h3>
          <p className="text-muted small mb-0 font-monospace">Verify student ownership claims and authorize releases</p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex gap-1 bg-white p-1 rounded border border-dark shadow-sm">
          {['All', 'pending', 'approved', 'rejected'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm rounded px-3 font-monospace text-capitalize ${
                statusFilter === cat
                  ? 'btn-dark text-white fw-bold'
                  : 'btn-light border-0 text-dark'
              }`}
              onClick={() => handleFilterChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-dark rounded shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-editorial align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" className="ps-4">Item</th>
                <th scope="col">Claimant</th>
                <th scope="col">Explanation</th>
                <th scope="col">Private Proof</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Decision</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No claims found.
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="ps-4">
                      {claim.item ? (
                        <div>
                          <div className="fw-medium text-dark">{claim.item.itemName}</div>
                          <div className="small text-muted">{claim.item.campusLocation}</div>
                        </div>
                      ) : (
                        <span className="text-muted small">Archived</span>
                      )}
                    </td>

                    <td>
                      <div className="fw-medium text-dark">{claim.claimant?.fullName}</div>
                      <div className="small text-muted">{claim.claimant?.email}</div>
                    </td>

                    <td>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={claim.claimExplanation}>
                        {claim.claimExplanation}
                      </div>
                    </td>

                    <td>
                      <div className="small text-danger text-truncate" style={{ maxWidth: '200px' }} title={claim.privateProofDetails}>
                        <i className="bi bi-lock me-1"></i>
                        {claim.privateProofDetails}
                      </div>
                    </td>

                    <td>
                      <span className="small text-muted">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <span className={
                        claim.status === 'approved'
                          ? 'badge-soft-found'
                          : claim.status === 'rejected'
                          ? 'badge-soft-lost'
                          : 'badge-soft-warning'
                      }>
                        {claim.status}
                      </span>
                    </td>

                    <td className="text-end pe-4">
                      {claim.status === 'pending' ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-light-minimal py-1 px-3 text-success"
                            onClick={() => openReviewModal(claim, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-light-minimal py-1 px-3 text-danger"
                            onClick={() => openReviewModal(claim, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-link btn-sm text-decoration-none text-muted p-0 small"
                          onClick={() => openReviewModal(claim, claim.status)}
                        >
                          Edit note
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {inspectingClaim && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold text-dark">Review Claim: {inspectingClaim.item?.itemName}</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInspectingClaim(null)}
                ></button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  {errorMessage && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {errorMessage}
                    </div>
                  )}

                  {/* Private proof box */}
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <span className="text-muted d-block small mb-1">Claimant's Private Proof:</span>
                    <div className="text-dark fw-medium">
                      {inspectingClaim.privateProofDetails}
                    </div>
                    <span className="text-muted d-block small mt-2 mb-1">Explanation:</span>
                    <div className="text-secondary">
                      {inspectingClaim.claimExplanation}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Decision</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="reviewAction"
                          id="actionApprove"
                          value="approved"
                          checked={reviewAction === 'approved'}
                          onChange={() => setReviewAction('approved')}
                        />
                        <label className="form-check-label text-success fw-medium small" htmlFor="actionApprove">
                          Approve
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="reviewAction"
                          id="actionReject"
                          value="rejected"
                          checked={reviewAction === 'rejected'}
                          onChange={() => setReviewAction('rejected')}
                        />
                        <label className="form-check-label text-danger fw-medium small" htmlFor="actionReject">
                          Reject
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Decision Note</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-minimal"
                    onClick={() => setInspectingClaim(null)}
                    disabled={reviewing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-dark-minimal"
                    disabled={reviewing}
                  >
                    {reviewing ? 'Saving...' : 'Confirm Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
