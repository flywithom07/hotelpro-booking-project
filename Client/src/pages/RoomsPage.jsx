import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';
import AlertMessage from '../components/AlertMessage';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter controls
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');

  const fetchRooms = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (type && type !== 'All') params.type = type;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.get('/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to retrieve available rooms. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [type, minPrice, maxPrice, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('All');
    setMinPrice('');
    setMaxPrice('');
    setFromDate('');
    setToDate('');
    setSearchParams({});
  };

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Page Header */}
        <div className="text-center mb-5">
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-2">
            Curated Accommodations
          </span>
          <h1 className="display-5 fw-bold font-serif text-dark mb-2">
            Rooms & Grand Suites
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Discover tailored comfort, breathtaking city views, and unparalleled luxury hospitality.
          </p>
        </div>

        {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}

        {/* Filter Bar */}
        <div className="card shadow-sm border-0 rounded-4 p-4 mb-5 bg-white">
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3 align-items-end">
              {/* Keyword Search */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Search Keywords
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-2 border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-2 border-start-0"
                    placeholder="Room # or amenity..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Room Category */}
              <div className="col-lg-2 col-md-6">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Category
                </label>
                <select
                  className="form-select border-2"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              {/* Check-in Date */}
              <div className="col-lg-2 col-md-4 col-sm-6">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Check-in
                </label>
                <input
                  type="date"
                  className="form-control border-2"
                  min={new Date().toISOString().split('T')[0]}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              {/* Check-out Date */}
              <div className="col-lg-2 col-md-4 col-sm-6">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Check-out
                </label>
                <input
                  type="date"
                  className="form-control border-2"
                  min={fromDate || new Date().toISOString().split('T')[0]}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              {/* Price Max */}
              <div className="col-lg-1 col-md-4 col-sm-6">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Max ($)
                </label>
                <input
                  type="number"
                  className="form-control border-2"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="col-lg-2 col-md-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-1"
                >
                  <i className="bi bi-funnel"></i>
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary py-2 rounded-3"
                  title="Reset Filters"
                  onClick={handleResetFilters}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-dark font-serif mb-0">
            Available Accommodations{' '}
            <span className="badge bg-secondary fs-6 rounded-pill ms-2">{rooms.length}</span>
          </h5>
          {(fromDate || toDate) && (
            <span className="small text-muted">
              <i className="bi bi-calendar-check text-success me-1"></i>
              Filtered by reservation availability
            </span>
          )}
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading rooms...</span>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="card border-0 rounded-4 shadow-sm p-5 text-center my-4">
            <i className="bi bi-door-closed fs-1 text-muted mb-3"></i>
            <h4 className="fw-bold font-serif text-dark">No Rooms Match Your Criteria</h4>
            <p className="text-muted">
              Try adjusting your date range, price filter, or selecting a different category.
            </p>
            <div className="mt-3">
              <button
                className="btn btn-warning rounded-pill px-4 fw-semibold"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {rooms.map((room) => (
              <div key={room._id} className="col-lg-4 col-md-6">
                <RoomCard room={room} fromDate={fromDate} toDate={toDate} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
