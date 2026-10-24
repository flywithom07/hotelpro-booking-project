import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rooms' | 'add-room' | 'users'

  // Data states
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter & Form states
  const [bookingFilter, setBookingFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Room form state
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Deluxe',
    price: '',
    description: '',
    features: 'High-speed Wi-Fi, Air Conditioning, Flat-screen TV, Private Bathroom',
    photos: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    isAvailable: true,
  });
  const [submittingRoom, setSubmittingRoom] = useState(false);

  // Fetch all admin data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bookingsRes, roomsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/bookings'),
        api.get('/rooms'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load administrative dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin Cancel Booking
  const handleAdminCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this guest reservation?')) {
      return;
    }

    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setSuccess('Reservation cancelled successfully. Room dates released.');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        fetchDashboardData(); // Refresh stats
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  // Toggle Room Availability
  const handleToggleRoomAvailability = async (roomId, currentAvailability) => {
    try {
      const res = await api.put(`/rooms/${roomId}`, {
        isAvailable: !currentAvailability,
      });
      if (res.data.success) {
        setSuccess(`Room ${res.data.room.roomNumber} status updated successfully.`);
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? { ...r, isAvailable: !currentAvailability } : r))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room availability');
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete Room ${roomNumber}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        setSuccess(res.data.message || `Room ${roomNumber} deleted.`);
        setRooms((prev) => prev.filter((r) => r._id !== roomId));
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    }
  };

  // Add Room Submit
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmittingRoom(true);

    try {
      const res = await api.post('/rooms', {
        roomNumber: newRoom.roomNumber.trim(),
        type: newRoom.type,
        price: Number(newRoom.price),
        description: newRoom.description.trim(),
        features: newRoom.features,
        photos: newRoom.photos,
        isAvailable: newRoom.isAvailable,
      });

      if (res.data.success) {
        setSuccess(`Room ${res.data.room.roomNumber} created successfully!`);
        // Reset form
        setNewRoom({
          roomNumber: '',
          type: 'Deluxe',
          price: '',
          description: '',
          features: 'High-speed Wi-Fi, Air Conditioning, Flat-screen TV, Private Bathroom',
          photos: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          isAvailable: true,
        });
        await fetchDashboardData();
        setActiveTab('rooms'); // Switch to rooms tab
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room. Please check input.');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Admin Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
          <div>
            <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-2">
              <i className="bi bi-shield-lock-fill me-1"></i> Executive Administration
            </span>
            <h1 className="display-6 fw-bold font-serif text-dark mb-1">
              Hotel Operations & Management
            </h1>
            <p className="text-muted mb-0">
              Oversee inventory, manage customer reservations, review users, and track revenue
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-dark rounded-pill px-4 mt-3 mt-md-0 fw-semibold"
            onClick={fetchDashboardData}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
          </button>
        </div>

        {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess('')} />}

        {/* KPI Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-sm-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Total Revenue</span>
                <div className="avatar-circle bg-warning bg-opacity-10 text-dark">
                  <i className="bi bi-currency-dollar fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-dark mb-0">
                ${stats?.totalRevenue ?? 0}
              </h2>
              <small className="text-success mt-2 d-block fw-semibold">
                <i className="bi bi-graph-up-arrow me-1"></i> Confirmed bookings
              </small>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Active Bookings</span>
                <div className="avatar-circle bg-success bg-opacity-10 text-success">
                  <i className="bi bi-calendar-check-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-success mb-0">
                {stats?.confirmedBookings ?? 0}
              </h2>
              <small className="text-muted mt-2 d-block">
                {stats?.cancelledBookings ?? 0} cancelled
              </small>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Room Inventory</span>
                <div className="avatar-circle bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-door-open-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-dark mb-0">
                {rooms.length}
              </h2>
              <small className="text-muted mt-2 d-block">Across all room types</small>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold text-uppercase">Registered Guests</span>
                <div className="avatar-circle bg-secondary bg-opacity-10 text-secondary">
                  <i className="bi bi-people-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 fw-bold font-serif text-dark mb-0">
                {users.length}
              </h2>
              <small className="text-muted mt-2 d-block">Customers & Administrators</small>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden mb-5">
          <div className="card-header bg-white border-bottom p-0">
            <ul className="nav nav-tabs border-0 flex-nowrap overflow-auto px-4 pt-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 fw-bold px-4 py-3 d-flex align-items-center gap-2 ${
                    activeTab === 'bookings' ? 'active text-warning border-bottom border-warning border-3' : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <i className="bi bi-calendar3"></i>
                  <span>All Bookings ({bookings.length})</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 fw-bold px-4 py-3 d-flex align-items-center gap-2 ${
                    activeTab === 'rooms' ? 'active text-warning border-bottom border-warning border-3' : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('rooms')}
                >
                  <i className="bi bi-door-open"></i>
                  <span>All Rooms ({rooms.length})</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 fw-bold px-4 py-3 d-flex align-items-center gap-2 ${
                    activeTab === 'add-room' ? 'active text-warning border-bottom border-warning border-3' : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('add-room')}
                >
                  <i className="bi bi-plus-circle"></i>
                  <span>Add Room</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 fw-bold px-4 py-3 d-flex align-items-center gap-2 ${
                    activeTab === 'users' ? 'active text-warning border-bottom border-warning border-3' : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people"></i>
                  <span>All Users ({users.length})</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4 p-md-5">
            {/* 1. ALL BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <h4 className="fw-bold font-serif text-dark mb-0">System Reservations</h4>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted fw-bold">Filter Status:</span>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${bookingFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingFilter('all')}
                      >
                        All ({bookings.length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${bookingFilter === 'confirmed' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingFilter('confirmed')}
                      >
                        Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${bookingFilter === 'cancelled' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingFilter('cancelled')}
                      >
                        Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="mb-0">No reservations found matching the selected filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted">
                          <th>Guest Details</th>
                          <th>Room</th>
                          <th>Dates & Duration</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <div className="fw-bold text-dark">{b.userId?.name || 'Unknown Guest'}</div>
                              <small className="text-muted d-block">{b.userId?.email || 'N/A'}</small>
                              <small className="text-muted">{b.phone}</small>
                            </td>
                            <td>
                              <span className="badge bg-dark me-1">Room {b.roomId?.roomNumber || 'N/A'}</span>
                              <span className="badge bg-warning text-dark">{b.roomId?.type || 'Room'}</span>
                            </td>
                            <td>
                              <div>{new Date(b.fromDate).toLocaleDateString()} — {new Date(b.toDate).toLocaleDateString()}</div>
                              <small className="text-muted">{b.totalDays} nights</small>
                            </td>
                            <td>
                              <span className="fw-bold font-serif fs-6 text-dark">${b.totalAmount}</span>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  b.status === 'confirmed' ? 'bg-success' : 'bg-secondary'
                                }`}
                              >
                                {b.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="text-end">
                              {b.status === 'confirmed' ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleAdminCancelBooking(b._id)}
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-muted small">No action</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. ALL ROOMS TAB */}
            {activeTab === 'rooms' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold font-serif text-dark mb-0">Hotel Room Inventory</h4>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark"
                    onClick={() => setActiveTab('add-room')}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add New Room
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No rooms in inventory yet. Add your first room using the 'Add Room' tab.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted">
                          <th>Preview</th>
                          <th>Room Number</th>
                          <th>Type</th>
                          <th>Price / Night</th>
                          <th>Availability</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((r) => {
                          const photo = r.photos && r.photos.length > 0 ? r.photos[0] : DEFAULT_IMAGE;
                          return (
                            <tr key={r._id}>
                              <td style={{ width: '80px' }}>
                                <img
                                  src={photo}
                                  alt={`Room ${r.roomNumber}`}
                                  className="rounded-3 object-fit-cover"
                                  style={{ width: '60px', height: '45px' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                  }}
                                />
                              </td>
                              <td>
                                <span className="fw-bold fs-6">Room {r.roomNumber}</span>
                              </td>
                              <td>
                                <span className="badge bg-warning text-dark fw-bold">{r.type}</span>
                              </td>
                              <td>
                                <span className="fw-bold font-serif text-dark">${r.price}</span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`btn btn-sm rounded-pill px-3 ${
                                    r.isAvailable ? 'btn-success' : 'btn-secondary'
                                  }`}
                                  onClick={() => handleToggleRoomAvailability(r._id, r.isAvailable)}
                                  title="Click to toggle availability"
                                >
                                  {r.isAvailable ? 'Available' : 'Unavailable'}
                                </button>
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm rounded-circle p-2"
                                  title="Delete Room"
                                  onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. ADD ROOM TAB */}
            {activeTab === 'add-room' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-4">
                  <h4 className="fw-bold font-serif text-dark mb-1">Create New Room</h4>
                  <p className="text-muted small">
                    Add luxury suites or executive bedrooms to the hotel reservation system
                  </p>
                </div>

                <form onSubmit={handleCreateRoom}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Room Number
                      </label>
                      <input
                        type="text"
                        className="form-control border-2"
                        placeholder="e.g. 401"
                        value={newRoom.roomNumber}
                        onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Room Category
                      </label>
                      <select
                        className="form-select border-2"
                        value={newRoom.type}
                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Price Per Night ($)
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control border-2"
                        placeholder="e.g. 250"
                        value={newRoom.price}
                        onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Initial Availability
                      </label>
                      <select
                        className="form-select border-2"
                        value={newRoom.isAvailable ? 'true' : 'false'}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, isAvailable: e.target.value === 'true' })
                        }
                      >
                        <option value="true">Available for Bookings</option>
                        <option value="false">Unavailable / Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Room Description
                    </label>
                    <textarea
                      rows="3"
                      className="form-control border-2"
                      placeholder="Detailed overview of room comfort, views, and aesthetic..."
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Features / Amenities (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="form-control border-2"
                      placeholder="King Bed, Ocean View, Wi-Fi, Mini Bar, Balcony"
                      value={newRoom.features}
                      onChange={(e) => setNewRoom({ ...newRoom, features: e.target.value })}
                    />
                    <small className="text-muted">Separate multiple amenities with commas</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Photo URLs (comma-separated image links)
                    </label>
                    <textarea
                      rows="2"
                      className="form-control border-2"
                      placeholder="https://images.unsplash.com/photo-..., https://..."
                      value={newRoom.photos}
                      onChange={(e) => setNewRoom({ ...newRoom, photos: e.target.value })}
                    ></textarea>
                    <small className="text-muted">Separate multiple image links with commas</small>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-warning py-3 rounded-pill fw-bold text-dark d-flex align-items-center justify-content-center gap-2 hover-lift"
                      disabled={submittingRoom}
                    >
                      {submittingRoom ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Adding Room to Inventory...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle fs-5"></i>
                          <span>Publish New Room</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. ALL USERS TAB */}
            {activeTab === 'users' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold font-serif text-dark mb-0">Registered User Accounts</h4>
                  <span className="badge bg-secondary rounded-pill px-3 py-2">
                    {users.length} Total Users
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted">
                          <th>User Profile</th>
                          <th>Email Address</th>
                          <th>Contact Phone</th>
                          <th>Access Role</th>
                          <th>Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar-circle bg-light border text-dark fw-bold">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="fw-bold text-dark">{u.name}</span>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.phone}</td>
                            <td>
                              <span
                                className={`badge rounded-pill ${
                                  u.userType === 'admin' ? 'bg-danger' : 'bg-primary'
                                }`}
                              >
                                {u.userType.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
