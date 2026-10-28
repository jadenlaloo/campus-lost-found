import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInspector } from '../context/InspectorContext';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { setActiveClaimItem, setActiveMatchItem } = useInspector();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await itemService.getById(id);
        if (res.data.success) {
          setItem(res.data.item);
        }
      } catch (err) {
        console.error('Failed to get item details:', err);
        setError(err.response?.data?.message || 'Item not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="main-column text-center py-5">
        <div className="spinner-border spinner-border-sm text-dark my-5" role="status"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="main-column p-4 text-center">
        <div className="p-5 bg-white border border-dark rounded max-w-md mx-auto" style={{ maxWidth: '440px' }}>
          <h5 className="fw-bold">Item Not Found</h5>
          <p className="text-muted small">{error || 'This report may have been withdrawn.'}</p>
          <Link to="/items" className="btn btn-sm btn-dark">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && item.submittedBy && (
    user.id === item.submittedBy._id || user._id === item.submittedBy._id
  );
  const canManage = isOwner || isAdmin;
  const isLost = item.reportType === 'lost';
  const isResolved = item.status === 'returned';

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    setDeleting(true);
    try {
      const res = await itemService.delete(item._id);
      if (res.data.success) {
        navigate('/items');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report.');
      setDeleting(false);
    }
  };

  const handleQuickResolve = async () => {
    try {
      const res = await itemService.update(item._id, { status: 'returned' });
      if (res.data.success) {
        setItem(res.data.item);
        alert('Marked as resolved!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="main-column p-4">
      {/* Back button */}
      <div className="mb-3">
        <Link to="/items" className="text-dark small text-decoration-none fw-semibold">
          <i className="bi bi-arrow-left me-1"></i> Back to all items
        </Link>
      </div>

      <div className="bg-white border border-dark rounded p-4 mb-4 shadow-sm">
        <div className="row g-4">
          {/* Cover Image */}
          <div className="col-md-5">
            <div className="border border-dark rounded bg-light overflow-hidden text-center" style={{ minHeight: '300px' }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="w-100 h-100 object-fit-contain p-2"
                  style={{ maxHeight: '380px' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center p-5 text-muted" style={{ minHeight: '300px' }}>
                  <i className="bi bi-box-seam fs-1 opacity-50"></i>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="col-md-7">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className={`badge-tag-editorial mb-2 d-inline-block ${isLost ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ border: '1px solid #000' }}>
                  {item.reportType.toUpperCase()}
                </span>
                <h3 className="fw-bold text-dark mb-1">{item.itemName}</h3>
                <div className="small text-muted font-monospace">
                  Category: {item.category} &bull; Date: {new Date(item.dateLostOrFound).toLocaleDateString()}
                </div>
              </div>

              <span className="badge bg-dark text-white text-capitalize">
                {item.status}
              </span>
            </div>

            <hr className="my-3 border-dark" />

            <div className="mb-3">
              <h6 className="fw-bold small text-uppercase text-muted">Description</h6>
              <p className="small text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {item.description}
              </p>
            </div>

            {item.identifyingCharacteristics && (
              <div className="mb-3 p-3 bg-light border border-dark rounded small">
                <span className="fw-bold d-block text-dark mb-1">
                  <i className="bi bi-fingerprint me-1"></i> Distinguishing Characteristics:
                </span>
                {item.isProtectedProof ? (
                  <span className="text-muted fst-italic">{item.identifyingCharacteristicsNotice}</span>
                ) : (
                  <span className="text-secondary">{item.identifyingCharacteristics}</span>
                )}
              </div>
            )}

            <div className="mb-4 small text-muted">
              <div><strong>Campus Location:</strong> {item.campusLocation} {item.specificLocationDetails && `(${item.specificLocationDetails})`}</div>
              {item.storageLocation && <div><strong>Current Holding Desk:</strong> {item.storageLocation}</div>}
              <div><strong>Reported By:</strong> {item.submittedBy?.fullName} ({item.contactInfo || item.submittedBy?.email})</div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {!isLost && !isResolved && (
                <button
                  className="btn-editorial-orange px-4 py-2"
                  onClick={() => setActiveClaimItem(item)}
                >
                  <i className="bi bi-play-fill"></i> Claim this Item
                </button>
              )}

              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => setActiveMatchItem(item)}
              >
                <i className="bi bi-shuffle me-1"></i> Find Potential Matches
              </button>

              {canManage && (
                <div className="ms-auto d-flex gap-2">
                  {!isResolved && (
                    <button className="btn btn-sm btn-outline-success" onClick={handleQuickResolve}>
                      Mark Resolved
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
