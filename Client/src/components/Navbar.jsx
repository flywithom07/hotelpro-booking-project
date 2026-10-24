import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeNav = () => setIsNavOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/" onClick={closeNav}>
          <div className="brand-icon bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-building fs-5"></i>
          </div>
          <span className="fs-4 tracking-wide font-serif">HOTEL<span className="text-warning">PRO</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ps-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/" onClick={closeNav}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/rooms" onClick={closeNav}>
                Rooms & Suites
              </NavLink>
            </li>
            {isAuthenticated && !isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/my-bookings" onClick={closeNav}>
                    My Bookings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/dashboard" onClick={closeNav}>
                    Dashboard
                  </NavLink>
                </li>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/admin" onClick={closeNav}>
                  <i className="bi bi-speedometer2 me-1"></i> Admin Portal
                </NavLink>
              </li>
            )}
          </ul>

          {/* User Auth Controls */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 text-light">
                  <span className="avatar-circle bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <div>
                    <div className="small fw-bold text-white mb-0 leading-none">
                      {user?.name}
                    </div>
                    <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} badge-xs`}>
                      {isAdmin ? 'ADMIN' : 'GUEST'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-light btn-sm px-3 rounded-pill"
                  onClick={() => {
                    closeNav();
                    handleLogout();
                  }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill" onClick={closeNav}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-warning btn-sm px-3 rounded-pill fw-semibold" onClick={closeNav}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
