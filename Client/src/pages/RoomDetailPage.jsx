import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

const RoomDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [bookedDateRanges, setBookedDateRanges] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking form state
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data.success) {
          setRoom(res.data.room);
          setBookedDateRanges(res.data.bookedDateRanges || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // Compute total days and total cost live
  let totalDays = 0;
  let totalAmount = 0;

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      const diffMs = end.getTime() - start.getTime();
      totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (room) {
        totalAmount = totalDays * room.price;
      }
    }
  }

  // Check if chosen range conflicts with existing bookings
  const isDateConflicting = () => {
    if (!fromDate || !toDate || bookedDateRanges.length === 0) return false;
    const start = new Date(fromDate);
    const end = new Date(toDate);

    return bookedDateRanges.some((range) => {
      const bStart = new Date(range.fromDate);
      const bEnd = new Date(range.toDate);
      return bStart < end && bEnd > start;
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }

    if (!fromDate || !toDate) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    if (totalDays < 1) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    if (isDateConflicting()) {
      setError('This room is already reserved during the selected dates. Please choose different dates.');
      return;
    }

    setBookingLoading(true);

    try {
      const res = await api.post('/bookings', {
        roomId: room._id,
        fromDate,
        toDate,
        phone: phone.trim(),
      });

      if (res.data.success) {
        setSuccess('Reservation confirmed successfully! Redirecting to your bookings...');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to complete booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-75 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading room...</span>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="container py-5">
        <AlertMessage variant="danger" message={error} />
        <div className="text-center mt-4">
          <Link to="/rooms" className="btn btn-dark rounded-pill px-4">
            ← Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  const photos = room.photos && room.photos.length > 0 ? room.photos : [DEFAULT_IMAGE];

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/rooms" className="text-muted text-decoration-none">Rooms</Link></li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Room {room.roomNumber} ({room.type})</li>
          </ol>
        </nav>

        {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage variant="success" message={success} />}

        <div className="row g-5">
          {/* Left Column: Photos & Details */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
              {/* Main Photo */}
              <div className="room-detail-hero position-relative">
                <img
                  src={photos[selectedPhoto]}
                  alt={`Room ${room.roomNumber}`}
                  className="w-100 room-detail-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                    {room.type} Suite
                  </span>
                  <span className="badge bg-dark px-3 py-2 rounded-pill fw-semibold">
                    Room {room.roomNumber}
                  </span>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {photos.length > 1 && (
                <div className="d-flex gap-2 p-3 bg-white border-top overflow-auto">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`rounded-3 cursor-pointer thumbnail-preview ${
                        selectedPhoto === idx ? 'border border-3 border-warning' : 'opacity-75'
                      }`}
                      style={{ width: '90px', height: '65px', objectFit: 'cover' }}
                      onClick={() => setSelectedPhoto(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Information Card */}
            <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="display-6 fw-bold font-serif text-dark mb-0">
                  {room.type} Suite — Room {room.roomNumber}
                </h2>
                <div className="text-end">
                  <span className="fs-3 fw-bold text-dark font-serif">${room.price}</span>
                  <span className="text-muted small"> / night</span>
                </div>
              </div>

              <hr className="my-4" />

              <h5 className="fw-bold text-dark mb-3">Room Overview</h5>
              <p className="text-muted leading-relaxed mb-4">
                {room.description}
              </p>

              <h5 className="fw-bold text-dark mb-3">Included Amenities & Features</h5>
              <div className="row g-3 mb-4">
                {room.features && room.features.map((feat, idx) => (
                  <div key={idx} className="col-md-6 col-sm-12">
                    <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                      <i className="bi bi-patch-check-fill text-warning fs-5"></i>
                      <span className="fw-medium text-dark">{feat}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Existing Reservations Advisory */}
              {bookedDateRanges.length > 0 && (
                <div className="alert alert-light border rounded-3 p-3 mt-3">
                  <h6 className="fw-bold text-secondary mb-2">
                    <i className="bi bi-calendar-event me-2 text-warning"></i>
                    Upcoming Reserved Dates for this Room:
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {bookedDateRanges.map((range, idx) => (
                      <span key={idx} className="badge bg-secondary bg-opacity-15 text-dark border px-2 py-1">
                        {new Date(range.fromDate).toLocaleDateString()} — {new Date(range.toDate).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Booking Widget */}
          <div className="col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 p-4 sticky-top bg-white" style={{ top: '100px' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <span className="text-muted small text-uppercase fw-bold">Rate from</span>
                <div>
                  <span className="fs-2 fw-bold font-serif text-dark">${room.price}</span>
                  <span className="text-muted small"> / night</span>
                </div>
              </div>

              <hr className="my-3" />

              <form onSubmit={handleBookingSubmit}>
                {/* Dates Selection */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    className="form-control border-2"
                    min={new Date().toISOString().split('T')[0]}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    className="form-control border-2"
                    min={fromDate || new Date().toISOString().split('T')[0]}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>

                {/* Phone number */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    Guest Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control border-2"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Real-time Calculation Breakdown */}
                {totalDays > 0 && (
                  <div className="bg-light p-3 rounded-3 mb-4">
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>${room.price} × {totalDays} {totalDays === 1 ? 'night' : 'nights'}</span>
                      <span>${totalAmount}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>Hospitality Taxes & Service</span>
                      <span className="text-success fw-bold">Included</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fw-bold text-dark fs-5 font-serif">
                      <span>Total Amount:</span>
                      <span className="text-warning">${totalAmount}</span>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-warning py-3 rounded-pill fw-bold fs-6 shadow-sm hover-lift d-flex align-items-center justify-content-center gap-2"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Securing Reservation...</span>
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <i className="bi bi-shield-check fs-5"></i>
                        <span>Confirm & Reserve</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right fs-5"></i>
                        <span>Sign In to Reserve</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-lock-fill text-muted me-1"></i>
                    No hidden fees • Instant server confirmation
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
