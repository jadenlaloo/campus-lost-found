import React, { useState } from 'react';
import { claimService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [claimExplanation, setClaimExplanation] = useState('');
  const [privateProofDetails, setPrivateProofDetails] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!claimExplanation.trim() || !privateProofDetails.trim()) {
      setError('Please provide an explanation and private verification details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await claimService.create({
        itemId: item._id,
        claimExplanation,
        privateProofDetails,
        supportingInfo,
      });

      if (res.data.success) {
        if (onSuccess) {
          onSuccess(res.data.message || 'Claim submitted.');
        }
        onClose();
      }
    } catch (err) {
      console.error('Submit claim error:', err);
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-content-editorial">
          <div className="modal-header modal-header-editorial">
            <h6 className="modal-title fw-bold text-dark mb-0">
              <i className="bi bi-shield-check me-1"></i> Submit Ownership Claim
            </h6>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-white">
              {/* Item summary */}
              <div className="d-flex align-items-center gap-3 p-2 bg-light border border-dark rounded mb-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="rounded object-fit-cover"
                    style={{ width: '48px', height: '48px' }}
                  />
                ) : (
                  <div className="bg-white rounded border d-flex align-items-center justify-content-center text-muted" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-box-seam"></i>
                  </div>
                )}
                <div>
                  <div className="fw-bold text-dark small">{item.itemName}</div>
                  <div className="small text-muted font-monospace">{item.campusLocation}</div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-3">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  Circumstances / Where you lost it *
                </label>
                <textarea
                  className="form-control border-dark font-monospace small"
                  rows="2"
                  placeholder="Explain when and where you misplaced it..."
                  value={claimExplanation}
                  onChange={(e) => setClaimExplanation(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-danger">
                  <i className="bi bi-lock-fill me-1"></i> Private Identifying Marks * (Confidential)
                </label>
                <textarea
                  className="form-control border-danger font-monospace small"
                  rows="2"
                  placeholder="Provide hidden serial numbers, wallpapers, scratch marks, inside contents..."
                  value={privateProofDetails}
                  onChange={(e) => setPrivateProofDetails(e.target.value)}
                  required
                ></textarea>
                <div className="form-text small text-muted">
                  Kept private from the public; only reviewed by staff to confirm ownership.
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark">
                  Supporting Note / Pickup Availability (Optional)
                </label>
                <input
                  type="text"
                  className="form-control border-dark small"
                  placeholder="e.g. Receipt available / pickup times"
                  value={supportingInfo}
                  onChange={(e) => setSupportingInfo(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer border-top border-dark py-2 px-4 bg-light">
              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-editorial-orange px-4 py-1 mb-0 w-auto"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
