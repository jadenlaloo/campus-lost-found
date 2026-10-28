import React from 'react';
import { Link } from 'react-router-dom';
import { useInspector } from '../context/InspectorContext';

export default function ItemInspector() {
  const { selectedItem, setActiveClaimItem, setActiveMatchItem } = useInspector();
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!selectedItem) {
    return (
      <aside className="inspector-column">
        <div className="text-center py-5 text-muted small">
          <i className="bi bi-hand-index-thumb fs-2 mb-2 d-block opacity-50"></i>
          Click any card to inspect item details, custody location, and claim options.
        </div>
      </aside>
    );
  }

  const isLost = selectedItem.reportType === 'lost';
  const isResolved = selectedItem.status === 'returned';

  return (
    <aside className="inspector-column">
      {/* Top Header Card Info */}
      <div className="inspector-header">
        {selectedItem.imageUrl ? (
          <img
            src={selectedItem.imageUrl}
            alt={selectedItem.itemName}
            className="inspector-cover"
          />
        ) : (
          <div className="inspector-cover d-flex align-items-center justify-content-center text-secondary">
            <i className="bi bi-box-seam fs-3 opacity-50"></i>
          </div>
        )}

        <div className="inspector-title-area flex-grow-1 overflow-hidden">
          <h5 className="text-truncate" title={selectedItem.itemName}>
            {selectedItem.itemName}
          </h5>
          <div className="inspector-author text-truncate">
            By: {selectedItem.submittedBy?.fullName || 'Campus Member'}
          </div>
          <div className="small text-muted text-truncate">
            Loc: {selectedItem.campusLocation}
          </div>
        </div>
      </div>

      {/* Button 1: White with dark border */}
      <Link
        to={`/items/${selectedItem._id}`}
        className="btn-editorial-light"
      >
        View Complete Details
      </Link>

      {/* Button 2: Bold Orange CTA */}
      {!isLost && !isResolved ? (
        <button
          className="btn-editorial-orange w-100"
          onClick={() => setActiveClaimItem(selectedItem)}
        >
          <i className="bi bi-play-fill fs-5"></i> Claim this Item
        </button>
      ) : (
        <button
          className="btn-editorial-orange w-100"
          onClick={() => setActiveMatchItem(selectedItem)}
        >
          <i className="bi bi-shuffle fs-6"></i> Check Matching Reports
        </button>
      )}

      {/* Action Tiles Row: Download, Save, Add to List */}
      <div className="inspector-actions-row">
        <button
          className={`btn-action-tile ${copied ? 'text-success fw-bold' : ''}`}
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.origin + `/items/${selectedItem._id}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          title="Share Item Link"
        >
          <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-share'}`}></i>
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>

        <button
          className={`btn-action-tile ${saved ? 'text-warning fw-bold' : ''}`}
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          title="Bookmark Item"
        >
          <i className={`bi ${saved ? 'bi-bookmark-check-fill text-warning' : 'bi-bookmark'}`}></i>
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          className="btn-action-tile"
          onClick={() => setActiveMatchItem(selectedItem)}
          title="View Matches"
        >
          <i className="bi bi-list-task"></i>
          <span>Matches</span>
        </button>
      </div>

      {/* Metadata Table */}
      <div className="inspector-metadata-table">
        <div className="inspector-metadata-row">
          <span className="inspector-metadata-label">Rating</span>
          <span className="inspector-metadata-val">
            ★★★★★ ({selectedItem.status})
          </span>
        </div>
        <div className="inspector-metadata-row">
          <span className="inspector-metadata-label">Date</span>
          <span className="inspector-metadata-val">
            {new Date(selectedItem.dateLostOrFound).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="inspector-metadata-row">
          <span className="inspector-metadata-label">Format</span>
          <span className="inspector-metadata-val text-capitalize">
            {selectedItem.reportType} Item ({selectedItem.category})
          </span>
        </div>
        <div className="inspector-metadata-row">
          <span className="inspector-metadata-label">Location</span>
          <span className="inspector-metadata-val">
            {selectedItem.campusLocation}
          </span>
        </div>
        {selectedItem.storageLocation && (
          <div className="inspector-metadata-row">
            <span className="inspector-metadata-label">Holding Desk</span>
            <span className="inspector-metadata-val text-truncate" style={{ maxWidth: '170px' }}>
              {selectedItem.storageLocation}
            </span>
          </div>
        )}
      </div>

      {/* Editorial Description Text */}
      <div className="inspector-description">
        {selectedItem.description}
      </div>

      {selectedItem.identifyingCharacteristics && !selectedItem.isProtectedProof && (
        <div className="mt-3 p-2 bg-white border border-dark rounded small">
          <span className="fw-bold d-block mb-1">Noticeable Marks:</span>
          <span className="text-muted">{selectedItem.identifyingCharacteristics}</span>
        </div>
      )}
    </aside>
  );
}
