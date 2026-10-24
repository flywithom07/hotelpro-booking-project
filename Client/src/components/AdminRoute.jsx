import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm text-center p-5 rounded-4">
          <i className="bi bi-shield-lock-fill fs-1 text-danger mb-3 d-block"></i>
          <h3 className="fw-bold">Access Denied</h3>
          <p className="text-muted">
            You do not have administrative privileges to view this section.
          </p>
          <a href="/dashboard" className="btn btn-outline-danger mt-3">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
