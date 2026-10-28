import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    department: '',
    studentId: '',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'All') params.role = roleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await userService.getAdminUsers(params);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');

    try {
      const res = await userService.createAdminUser(newUserForm);
      if (res.data.success) {
        setToastMessage('User registered.');
        setShowAddModal(false);
        setNewUserForm({
          fullName: '',
          email: '',
          password: '',
          role: 'user',
          status: 'active',
          department: '',
          studentId: '',
          phone: '',
        });
        fetchUsers();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMessage('');

    try {
      const res = await userService.updateAdminUser(editingUser._id, editingUser);
      if (res.data.success) {
        setToastMessage('User updated.');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Delete account for "${targetUser.fullName}"?`)) return;
    try {
      const res = await userService.deleteAdminUser(targetUser._id);
      if (res.data.success) {
        setToastMessage('User deleted.');
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await userService.updateAdminUser(targetUser._id, { status: nextStatus });
      if (res.data.success) {
        setToastMessage(`Status set to ${nextStatus}.`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
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
          <span className="badge bg-warning text-dark border border-dark mb-2 px-2 py-1 font-monospace">Accounts Directory</span>
          <h3 className="fw-bold text-dark mb-1">Campus User Management</h3>
          <p className="text-muted small mb-0 font-monospace">Manage student, staff, and faculty accounts and role privileges</p>
        </div>

        <button
          className="btn-editorial-orange px-3 py-2 w-auto mb-0"
          onClick={() => {
            setErrorMessage('');
            setShowAddModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-1"></i> Add User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-dark rounded p-3 mb-4 shadow-sm">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-12 col-md-2 d-flex gap-1">
              <button type="submit" className="btn btn-dark-minimal flex-grow-1">
                Filter
              </button>
              <button
                type="button"
                className="btn btn-light-minimal px-2"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('All');
                  setStatusFilter('All');
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-dark rounded shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-editorial align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" className="ps-4">User</th>
                <th scope="col">ID</th>
                <th scope="col">Department</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Registered</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="ps-4">
                      <div>
                        <div className="fw-medium text-dark">{u.fullName}</div>
                        <div className="small text-muted">{u.email}</div>
                      </div>
                    </td>

                    <td>
                      <span className="small text-muted">{u.studentId || '—'}</span>
                    </td>

                    <td>
                      <span className="small text-muted">{u.department || 'General'}</span>
                    </td>

                    <td>
                      <span className={u.role === 'admin' ? 'badge-soft-warning' : 'badge-soft-neutral'}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <span className={u.status === 'active' ? 'badge-soft-found' : 'badge-soft-lost'}>
                        {u.status}
                      </span>
                    </td>

                    <td>
                      <span className="small text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-light-minimal py-1 px-2 text-muted"
                          onClick={() => {
                            setErrorMessage('');
                            setEditingUser({ ...u });
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-light-minimal py-1 px-2 text-muted"
                          onClick={() => handleToggleStatus(u)}
                          title="Toggle Status"
                        >
                          <i className={`bi ${u.status === 'active' ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'}`}></i>
                        </button>

                        <button
                          className="btn btn-light-minimal py-1 px-2 text-danger"
                          onClick={() => handleDeleteUser(u)}
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
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold text-dark">Add New User</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  {errorMessage && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {errorMessage}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small text-muted">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUserForm.fullName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small text-muted">Role</label>
                      <select
                        className="form-select"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small text-muted">Status</label>
                      <select
                        className="form-select"
                        value={newUserForm.status}
                        onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-minimal"
                    onClick={() => setShowAddModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-dark-minimal"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="modal show d-block modal-overlay" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <h6 className="modal-title fw-semibold text-dark">Edit User</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingUser(null)}
                ></button>
              </div>

              <form onSubmit={handleEditUser}>
                <div className="modal-body p-4">
                  {errorMessage && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {errorMessage}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small text-muted">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingUser.fullName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small text-muted">Role</label>
                      <select
                        className="form-select"
                        value={editingUser.role || 'user'}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small text-muted">Status</label>
                      <select
                        className="form-select"
                        value={editingUser.status || 'active'}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">New Password (Optional)</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank to keep existing password"
                        value={editingUser.newPassword || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-minimal"
                    onClick={() => setEditingUser(null)}
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
    </div>
  );
}
