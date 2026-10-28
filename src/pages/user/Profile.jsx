import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, authService } from '../../services/api';

export default function Profile() {
  const { user, updateProfileUser } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await userService.updateProfile(profileData);
      if (res.data.success) {
        updateProfileUser(res.data.user);
        setProfileSuccess('Profile saved successfully.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password changed.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="main-column">
      <div className="mb-4 pb-2 border-bottom border-dark">
        <h4 className="fw-bold text-dark mb-0">Settings & Profile</h4>
        <span className="small text-muted font-monospace">Manage campus account information and security</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="p-4 bg-white border border-dark rounded shadow-xs">
            <h6 className="fw-bold text-dark mb-3 small text-uppercase">
              Personal Information
            </h6>

            {profileSuccess && (
              <div className="alert alert-success py-2 small mb-3">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="alert alert-danger py-2 small mb-3">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Email</label>
                <input
                  type="email"
                  className="form-control border-dark small bg-light font-monospace"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  type="text"
                  className="form-control border-dark small"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Student / Staff ID</label>
                  <input
                    type="text"
                    className="form-control border-dark small font-monospace"
                    value={profileData.studentId}
                    onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Department</label>
                  <input
                    type="text"
                    className="form-control border-dark small"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control border-dark small font-monospace"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn-editorial-orange px-4 py-1 w-auto"
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="p-4 bg-white border border-dark rounded shadow-xs">
            <h6 className="fw-bold text-dark mb-3 small text-uppercase">
              Change Password
            </h6>

            {passwordSuccess && (
              <div className="alert alert-success py-2 small mb-3">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="alert alert-danger py-2 small mb-3">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Current Password</label>
                <input
                  type="password"
                  className="form-control border-dark small"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">New Password</label>
                <input
                  type="password"
                  className="form-control border-dark small"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Confirm Password</label>
                <input
                  type="password"
                  className="form-control border-dark small"
                  placeholder="••••••••"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-sm btn-outline-dark w-100"
                disabled={passwordSaving}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
