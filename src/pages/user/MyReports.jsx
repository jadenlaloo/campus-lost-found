import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { itemService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useInspector } from '../../context/InspectorContext';

export default function MyReports() {
  const { user } = useAuth();
  const { setSelectedItem, setActiveMatchItem } = useInspector();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'lost');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await itemService.getAll({
        submittedBy: user?.id || user?._id,
        reportType: activeTab,
        limit: 50,
      });

      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [activeTab, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      itemName: item.itemName,
      description: item.description,
      campusLocation: item.campusLocation,
      specificLocationDetails: item.specificLocationDetails || '',
      storageLocation: item.storageLocation || '',
      status: item.status,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const res = await itemService.update(editingItem._id, editFormData);
      if (res.data.success) {
        alert('Report updated.');
        setEditingItem(null);
        fetchMyReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (item, newStatus) => {
    try {
      const res = await itemService.update(item._id, { status: newStatus });
      if (res.data.success) {
        fetchMyReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const res = await itemService.delete(itemId);
      if (res.data.success) {
        fetchMyReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report.');
    }
  };

  return (
    <div className="main-column">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
        <div>
          <h4 className="fw-bold text-dark mb-0">Library: My Reports</h4>
          <span className="small text-muted font-monospace">Manage filed lost & found belongings</span>
        </div>

        <div className="d-flex gap-2">
          <button
            className={`btn-tag-editorial ${activeTab === 'lost' ? 'active' : ''}`}
            onClick={() => handleTabChange('lost')}
          >
            Lost Items
          </button>
          <button
            className={`btn-tag-editorial ${activeTab === 'found' ? 'active' : ''}`}
            onClick={() => handleTabChange('found')}
          >
            Found Items
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-4 bg-white border border-dark rounded text-center text-muted small">
          No {activeTab} reports on record.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-3 bg-white border border-dark rounded shadow-xs"
              onClick={() => setSelectedItem(item)}
            >
              <div className="row g-3 align-items-center">
                <div className="col-auto">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="rounded border border-dark object-fit-cover"
                      style={{ width: '60px', height: '60px' }}
                    />
                  ) : (
                    <div className="bg-light rounded border border-dark d-flex align-items-center justify-content-center text-muted" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-box-seam"></i>
                    </div>
                  )}
                </div>

                <div className="col">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${item.reportType === 'lost' ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ border: '1px solid #000', fontSize: '0.65rem' }}>
                      {item.reportType.toUpperCase()}
                    </span>
                    <span className="badge bg-white text-dark border border-dark small">{item.status}</span>
                  </div>

                  <h6 className="fw-bold mb-1 text-dark">
                    {item.itemName}
                  </h6>

                  <div className="small text-muted font-monospace">
                    {item.campusLocation} &bull; {new Date(item.dateLostOrFound).toLocaleDateString()}
                  </div>
                </div>

                <div className="col-12 col-md-auto d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(item);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMatchItem(item);
                    }}
                    title="Find Matches"
                  >
                    <i className="bi bi-shuffle"></i>
                  </button>
                  {item.status !== 'returned' && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatusChange(item, 'returned');
                      }}
                    >
                      Resolved
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-editorial">
              <div className="modal-header modal-header-editorial">
                <h6 className="modal-title fw-bold text-dark mb-0">Edit Report</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingItem(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4 bg-white">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Item Name</label>
                    <input
                      type="text"
                      className="form-control border-dark small"
                      value={editFormData.itemName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, itemName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      rows="3"
                      className="form-control border-dark small"
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Status</label>
                    <select
                      className="form-select border-dark small"
                      value={editFormData.status || 'unresolved'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="unresolved">Unresolved</option>
                      <option value="returned">Returned / Resolved</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top border-dark py-2 px-4 bg-light">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-editorial-orange px-4 py-1 mb-0 w-auto"
                    disabled={editSubmitting}
                  >
                    {editSubmitting ? 'Saving...' : 'Save Updates'}
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
