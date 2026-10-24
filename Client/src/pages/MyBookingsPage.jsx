import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cancellation modal state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;

    setCancelLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.patch(`/bookings/${cancellingId}/cancel`);
      if (res.data.success) {
        setSuccess(res.data.message || 'Booking cancelled successfully. Dates are now freed.');
        // Update booking state in list
        setBookings((prev) =>
          prev.map((b) => (b._id === cancellingId ? { ...b, status: 'cancelled' } : b))
        );
        setCancellingId(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
          <div>
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-2">
              Guest Management
            </span>
            <h1 className="display-6 fw-bold font-serif text-dark mb-1">My Reservations</h1>
            <p className="text-muted mb-0">
              Manage your upcoming stays, view reservation history, or cancel bookings
            </p>
          </div>
          <Link to="/rooms" className="btn btn-warning rounded-pill px-4 fw-bold text-dark mt-3 mt-md-0">
            <i className="bi bi-plus-lg me-1"></i> New Reservation
          </Link>
        </div>

        {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading reservations...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white my-4">
            <i className="bi bi-calendar-x display-3 text-muted mb-3"></i>
            <h4 className="fw-bold font-serif text-dark mb-2">No Reservations Found</h4>
            <p className="text-muted max-w-md mx-auto mb-4">
              You haven't reserved any rooms yet. Explore our luxury suites and schedule your next getaway today.
            </p>
            <div>
              <Link to="/rooms" className="btn btn-warning rounded-pill px-4 fw-bold">
                Browse Rooms & Suites
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {bookings.map((booking) => {
              const room = booking.roomId;
              const photo =
                room?.photos && room.photos.length > 0 ? room.photos[0] : DEFAULT_IMAGE;
              const isConfirmed = booking.status === 'confirmed';

              return (
                <div
                  key={booking._id}
                  className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white booking-card transition-all"
                >
                  <div className="row g-0 align-items-center">
                    {/* Room Thumbnail */}
                    <div className="col-md-3">
                      <div className="position-relative h-100" style={{ minHeight: '190px' }}>
                        <img
                          src={photo}
                          alt={room ? `Room ${room.roomNumber}` : 'Room'}
                          className="w-100 h-100 object-fit-cover position-absolute"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6 p-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-dark px-3 py-1 rounded-pill">
                          Room {room?.roomNumber || 'N/A'}
                        </span>
                        <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold">
                          {room?.type || 'Room'}
                        </span>
                        <span
                          className={`badge rounded-pill px-3 py-1 fw-bold ${
                            isConfirmed ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <h5 className="fw-bold font-serif text-dark mb-3">
                        {room ? `${room.type} Suite` : 'Hotel Reservation'}
                      </h5>

                      <div className="row g-2 text-muted small mb-2">
                        <div className="col-sm-6">
                          <i className="bi bi-box-arrow-in-right text-warning me-2"></i>
                          <strong>Check-in:</strong> {new Date(booking.fromDate).toLocaleDateString()}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-box-arrow-right text-warning me-2"></i>
                          <strong>Check-out:</strong> {new Date(booking.toDate).toLocaleDateString()}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-moon-stars text-warning me-2"></i>
                          <strong>Duration:</strong> {booking.totalDays} {booking.totalDays === 1 ? 'Night' : 'Nights'}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-telephone text-warning me-2"></i>
                          <strong>Phone:</strong> {booking.phone}
                        </div>
                      </div>

                      <small className="text-muted text-break">
                        <strong>Booking Ref:</strong> {booking._id}
                      </small>
                    </div>

                    {/* Amount & Action */}
                    <div className="col-md-3 p-4 text-md-end border-start-md bg-light bg-opacity-50 h-100 d-flex flex-column justify-content-center">
                      <div className="mb-3">
                        <small className="text-muted d-block text-uppercase fw-bold">Total Paid / Due</small>
                        <span className="fs-3 fw-bold font-serif text-dark">${booking.totalAmount}</span>
                      </div>

                      <div>
                        {isConfirmed ? (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                            onClick={() => setCancellingId(booking._id)}
                          >
                            <i className="bi bi-x-circle me-1"></i> Cancel Booking
                          </button>
                        ) : (
                          <span className="badge bg-secondary py-2 px-3 rounded-pill text-uppercase">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancellingId && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark font-serif">
                    Confirm Cancellation
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCancellingId(null)}
                  ></button>
                </div>
                <div className="modal-body py-4">
                  <p className="text-muted mb-0">
                    Are you sure you want to cancel this booking? This action will immediately release your reserved dates back into the hotel inventory.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setCancellingId(null)}
                    disabled={cancelLoading}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 fw-semibold"
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Reservation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
