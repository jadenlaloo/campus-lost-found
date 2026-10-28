import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        phone: formData.phone.trim(),
      });

      if (data.success) {
        navigate('/user/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-column d-flex align-items-center justify-content-center py-4">
      <div className="w-100" style={{ maxWidth: '540px' }}>
        <div className="bg-white border border-dark rounded shadow-sm overflow-hidden">
          <div className="p-3 border-bottom border-dark" style={{ backgroundColor: 'var(--yellow-accent)' }}>
            <h5 className="fw-bold mb-0 text-dark">Create Campus Account</h5>
            <span className="small text-dark opacity-75 font-monospace">Student & Staff Registration</span>
          </div>

          <div className="p-4">
            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Full Legal Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control border-dark small"
                    placeholder="e.g. Jessica Taylor"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Campus Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-dark small"
                    placeholder="name@campus.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control border-dark small"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control border-dark small"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Student / Staff ID</label>
                  <input
                    type="text"
                    name="studentId"
                    className="form-control border-dark small font-monospace"
                    placeholder="CS-2024-001"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control border-dark small"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  type="submit"
                  className="btn-editorial-orange w-100 py-2"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>

            <div className="text-center mt-3 small">
              <span className="text-muted">Already registered? </span>
              <Link to="/login" className="fw-bold text-dark text-decoration-underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
