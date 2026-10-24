import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container text-center py-5">
        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-3">
          Error 404
        </span>
        <h1 className="display-1 fw-bold font-serif text-dark mb-3">404</h1>
        <h2 className="fw-bold font-serif text-dark mb-3">Room or Suite Not Found</h2>
        <p className="text-muted max-w-md mx-auto mb-4">
          The page or reservation portal you are looking for does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
