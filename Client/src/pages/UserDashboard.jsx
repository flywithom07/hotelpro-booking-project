import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Failed to load user bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Welcome Banner */}
        <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 mb-5 bg-dark text-white position-relative overflow-hidden">
          <div className="position-absolute end-0 top-0 bottom-0 d-none d-lg-block opacity-10 pe-5">
            <i className="bi bi-building display-1 text-warning" style={{ fontSize: '14rem' }}></i>
          </div>
          <div className="position-relative z-1">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-3">
              Member Dashboard
            </span>
            <h1 className="display-5 fw-bold font-serif mb-2">
              Welcome Back, {user?.name}!
            </h1>
            <p className="text-light text-opacity-80 max-w-xl mb-4">
              Here is an overview of your active hotel bookings, reservation details, and guest profile.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/rooms" className="btn btn-warning rounded-pill px-4 fw-semibold text-dark">
                <i className="bi bi-plus-circle me-2"></i> Book a New Room
              </Link>
              <Link to="/my-bookings" className="btn btn-outline-light rounded-pill px-4 fw-semibold">
                <i className="bi bi-calendar-check me-2"></i> View All Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small fw-bold text-uppercase">Total Bookings</span>
                <div className="avatar-circle bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-journal-bookmark-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-dark mb-0">{bookings.length}</h2>
              <small className="text-muted mt-2 d-block">Lifetime reservations made</small>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small fw-bold text-uppercase">Confirmed & Active</span>
                <div className="avatar-circle bg-success bg-opacity-10 text-success">
                  <i className="bi bi-check-circle-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-success mb-0">{confirmedBookings.length}</h2>
              <small className="text-muted mt-2 d-block">Ready for your upcoming stay</small>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small fw-bold text-uppercase">Cancelled</span>
                <div className="avatar-circle bg-secondary bg-opacity-10 text-secondary">
                  <i className="bi bi-x-circle-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-secondary mb-0">{cancelledBookings.length}</h2>
              <small className="text-muted mt-2 d-block">Cancelled reservations</small>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* User Profile Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold font-serif text-dark mb-4">Profile Information</h5>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="avatar-circle bg-warning text-dark fs-4 fw-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="fw-bold mb-0">{user?.name}</h6>
                  <span className="badge bg-primary text-white">Ordinary Guest</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3 text-muted small">
                <div>
                  <span className="fw-bold text-dark d-block">Email Address</span>
                  <span>{user?.email}</span>
                </div>
                <div>
                  <span className="fw-bold text-dark d-block">Contact Phone</span>
                  <span>{user?.phone}</span>
                </div>
                <div>
                  <span className="fw-bold text-dark d-block">Account Status</span>
                  <span className="text-success fw-semibold">
                    <i className="bi bi-shield-check me-1"></i> Verified Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reservations Preview */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold font-serif text-dark mb-0">Recent Reservations</h5>
                <Link to="/my-bookings" className="text-warning fw-semibold text-decoration-none small">
                  View All ({bookings.length}) →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 mb-2 d-block text-secondary"></i>
                  <p>You have not made any hotel bookings yet.</p>
                  <Link to="/rooms" className="btn btn-warning rounded-pill px-4 btn-sm fw-semibold">
                    Explore Rooms
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b._id} className="list-group-item px-0 py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="fw-bold text-dark mb-0">
                              Room {b.roomId?.roomNumber || 'N/A'} — {b.roomId?.type || 'Room'}
                            </h6>
                            <span
                              className={`badge rounded-pill ${
                                b.status === 'confirmed' ? 'bg-success' : 'bg-secondary'
                              }`}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </div>
                          <small className="text-muted d-block">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(b.fromDate).toLocaleDateString()} to {new Date(b.toDate).toLocaleDateString()} ({b.totalDays} nights)
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold text-dark font-serif">${b.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
