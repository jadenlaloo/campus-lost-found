import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await login(email.trim(), password);
      if (data.success) {
        if (from) {
          navigate(from, { replace: true });
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-column d-flex align-items-center justify-content-center py-4">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="bg-white border border-dark rounded shadow-sm overflow-hidden">
          <div className="p-3 border-bottom border-dark" style={{ backgroundColor: 'var(--yellow-accent)' }}>
            <h5 className="fw-bold mb-0 text-dark">Portal Sign In</h5>
            <span className="small text-dark opacity-75 font-monospace">Campus Lost & Found System</span>
          </div>

          <div className="p-4">
            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Campus Email</label>
                <input
                  type="email"
                  className="form-control border-dark small"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control border-dark small"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-editorial-orange w-100 py-2 mb-3"
                disabled={submitting}
              >
                {submitting ? 'Signing in...' : 'Sign In to Portal'}
              </button>
            </form>

            <div className="text-center mt-3 small">
              <span className="text-muted">Need an account? </span>
              <Link to="/register" className="fw-bold text-dark text-decoration-underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}