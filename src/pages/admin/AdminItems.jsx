import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { itemService } from '../../services/api';
import MatchSuggestionsModal from '../../components/MatchSuggestionsModal';

const CATEGORIES = [
  'All',
  'Electronics',
  'Accessories',
  'Books & Stationery',
  'ID & Cards',
  'Clothing',
  'Keys & Wallets',
  'Bags & Backpacks',
  'Other',
];

const LOCATIONS = [
  'All',
  'Central Library',
  'Student Union / Center',
  'Science & Engineering Hall',
  'Main Cafeteria',
  'Sports Complex / Gymnasium',
  'Arts & Humanities Building',
  'North Dormitories',
  'South Dormitories',
  'Campus Green / Quad',
  'Other',
];

export default function AdminItems() {
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [campusLocation, setCampusLocation] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [matchItem, setMatchItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    itemName: '',
    category: 'Electronics',
    reportType: 'found',
    description: '',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    campusLocation: 'Central Library',
    specificLocationDetails: '',
    storageLocation: 'Campus Safety Office Desk Room 104',
    identifyingCharacteristics: '',
    contactInfo: 'Campus Safety Administration',
    imageUrl: '',
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (reportType !== 'All') params.reportType = reportType;
      if (status !== 'All') params.status = status;
      if (campusLocation !== 'All') params.campusLocation = campusLocation;

      const res = await itemService.getAll(params);
      if (res.data.success) {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, category, reportType, status, campusLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await itemService.create(createForm);
      if (res.data.success) {
        setToastMessage('Item report created.');
        setShowCreateModal(false);
        setCreateForm({
          itemName: '',
          category: 'Electronics',
          reportType: 'found',
          description: '',
          dateLostOrFound: new Date().toISOString().split('T')[0],
          campusLocation: 'Central Library',
          specificLocationDetails: '',
          storageLocation: 'Campus Safety Office Desk Room 104',
          identifyingCharacteristics: '',
          contactInfo: 'Campus Safety Administration',
          imageUrl: '',
        });
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await itemService.update(editingItem._id, editingItem);
      if (res.data.success) {
        setToastMessage('Item report updated.');
        setEditingItem(null);
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"?`)) return;
    try {
      const res = await itemService.delete(item._id);
      if (res.data.success) {
        setToastMessage('Item deleted.');
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await itemService.update(itemId, { status: newStatus });
      if (res.data.success) {
        setToastMessage(`Status changed to ${newStatus}`);
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
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
          <span className="badge bg-warning text-dark border border-dark mb-2 px-2 py-1 font-monospace">Property Custody</span>
          <h3 className="fw-bold text-dark mb-1">Campus Items Inventory</h3>
          <p className="text-muted small mb-0 font-monospace">Search, update, reconcile, or remove campus property records</p>
        </div>

        <button
          className="btn-editorial-orange px-3 py-2 w-auto mb-0"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> New Item Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-dark rounded p-3 mb-4 shadow-sm">
        <form onSubmit={handleSearch}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setPage(1); }}
              >
                <option value="All">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="All">All Statuses</option>
                <option value="unresolved">Unresolved</option>
                <option value="under_review">Under Review</option>
                <option value="returned">Returned</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={campusLocation}
                onChange={(e) => { setCampusLocation(e.target.value); setPage(1); }}
              >
                <option value="All">All Locations</option>
                {LOCATIONS.filter((l) => l !== 'All').map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-1 d-flex gap-1">
              <button type="submit" className="btn btn-dark-minimal flex-grow-1" title="Filter">
                <i className="bi bi-funnel"></i>
              </button>
              <button
                type="button"
                className="btn btn-light-minimal px-2"
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setReportType('All');
                  setStatus('All');
                  setCampusLocation('All');
                  setPage(1);
                }}
                title="Reset"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-dark rounded shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-editorial align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" className="ps-4">Item</th>
                <th scope="col">Type</th>
                <th scope="col">Category</th>
                <th scope="col">Location</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="rounded object-fit-cover"
                            style={{ width: '36px', height: '36px' }}
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-box-seam"></i>
                          </div>
                        )}
                        <div>
                          <div className="fw-medium text-dark">{item.itemName}</div>
                          <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={item.reportType === 'lost' ? 'badge-soft-lost' : 'badge-soft-found'}>
                        {item.reportType}
                      </span>
                    </td>

                    <td>
                      <span className="small text-muted">{item.category}</span>
                    </td>

                    <td>
                      <span className="small text-dark">{item.campusLocation}</span>
                    </td>

                    <td>
                      <span className="small text-muted">
                        {new Date(item.dateLostOrFound).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm py-0 border-0 bg-light"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        style={{ width: 'auto', fontSize: '0.8rem' }}
                      >
                        <option value="unresolved">Unresolved</option>
                        <option value="under_review">Under Review</option>
                        <option value="returned">Returned</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </td>

                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/items/${item._id}`}
                          className="btn btn-light-minimal py-1 px-2 text-muted"
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-light-minimal py-1 px-2 text-muted"
                          onClick={() => setEditingItem(item)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-light-minimal py-1 px-2 text-muted"
                          onClick={() => setMatchItem(item)}
                          title="Matches"
                        >
                          <i className="bi bi-shuffle"></i>
                        </button>
                        <button
                          className="btn btn-light-minimal py-1 px-2 text-danger"
                          onClick={() => handleDelete(item)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top small text-muted">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-light-minimal py-0 px-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-sm btn-light-minimal py-0 px-2"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold text-dark">Create Report</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Report Type</label>
                      <select
                        className="form-select"
                        value={createForm.reportType}
                        onChange={(e) => setCreateForm({ ...createForm, reportType: e.target.value })}
                        required
                      >
                        <option value="found">Found Item</option>
                        <option value="lost">Lost Item</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Category</label>
                      <select
                        className="form-select"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                        required
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. iPad Pro with Apple Pencil"
                        value={createForm.itemName}
                        onChange={(e) => setCreateForm({ ...createForm, itemName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Campus Location</label>
                      <select
                        className="form-select"
                        value={createForm.campusLocation}
                        onChange={(e) => setCreateForm({ ...createForm, campusLocation: e.target.value })}
                        required
                      >
                        {LOCATIONS.filter((l) => l !== 'All').map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={createForm.dateLostOrFound}
                        onChange={(e) => setCreateForm({ ...createForm, dateLostOrFound: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Holding Location (If Found)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createForm.storageLocation}
                        onChange={(e) => setCreateForm({ ...createForm, storageLocation: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Image URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={createForm.imageUrl}
                        onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-minimal"
                    onClick={() => setShowCreateModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-dark-minimal"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : 'Create Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold text-dark">Edit Item</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingItem(null)}
                ></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-muted">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem.itemName || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Status</label>
                      <select
                        className="form-select"
                        value={editingItem.status || 'unresolved'}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      >
                        <option value="unresolved">Unresolved</option>
                        <option value="under_review">Under Review</option>
                        <option value="returned">Returned</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Campus Location</label>
                      <select
                        className="form-select"
                        value={editingItem.campusLocation || 'Other'}
                        onChange={(e) => setEditingItem({ ...editingItem, campusLocation: e.target.value })}
                      >
                        {LOCATIONS.filter((l) => l !== 'All').map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-muted">Storage Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingItem.storageLocation || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, storageLocation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-minimal"
                    onClick={() => setEditingItem(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-dark-minimal"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Matches Modal */}
      {matchItem && (
        <MatchSuggestionsModal
          item={matchItem}
          onClose={() => setMatchItem(null)}
        />
      )}
    </div>
  );
}
