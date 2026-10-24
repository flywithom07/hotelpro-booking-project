import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role or previous location
      if (from) {
        navigate(from, { replace: true });
      } else if (user.userType === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="brand-icon bg-warning text-dark rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                  <i className="bi bi-shield-lock-fill fs-4"></i>
                </div>
                <h2 className="fw-bold font-serif text-dark mb-1">Welcome Back</h2>
                <p className="text-muted small">
                  Sign in to manage your luxury hotel reservations
                </p>
              </div>

              {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-2 border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-2 border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-0">
                      Password
                    </label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-2 border-end-0">
                      <i className="bi bi-key text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-2 border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn btn-dark py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 hover-lift"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Quick-Fill Buttons */}
              <div className="border-top pt-4 mt-2">
                <p className="small text-muted text-center mb-2 fw-semibold">
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                  Quick Test Credentials:
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => handleDemoLogin('customer@hotelpro.com', 'CustomerPass123!')}
                  >
                    Demo Customer
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    onClick={() => handleDemoLogin('admin@hotelpro.com', 'AdminPassword123!')}
                  >
                    Demo Admin
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4 pt-2">
                <span className="text-muted small">Don't have an account yet? </span>
                <Link to="/register" className="text-warning fw-bold text-decoration-none small">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
