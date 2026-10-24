import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search widget state
  const [roomType, setRoomType] = useState('All');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    // Set default check-in to today, check-out to tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setCheckIn(today);
    setCheckOut(tomorrow);

    const fetchFeatured = async () => {
      try {
        const res = await api.get('/rooms');
        if (res.data.success) {
          // Show top 3 rooms
          setFeaturedRooms(res.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (roomType !== 'All') params.set('type', roomType);
    if (checkIn) params.set('fromDate', checkIn);
    if (checkOut) params.set('toDate', checkOut);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-white position-relative py-5">
        <div className="hero-overlay"></div>
        <div className="container position-relative py-5">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-8 mx-auto text-center">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-3">
                Experience Grand Luxury
              </span>
              <h1 className="display-3 fw-bold font-serif mb-4 text-shadow">
                Where Unparalleled Elegance Meets Modern Hospitality
              </h1>
              <p className="lead text-light text-opacity-90 mb-5 fs-5">
                Immerse yourself in bespoke suites, five-star culinary creations, and world-class concierge service tailored for every moment of your stay.
              </p>

              {/* Booking Search Widget */}
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white bg-opacity-95 backdrop-blur text-start">
                <form onSubmit={handleSearch}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Room Type
                      </label>
                      <select
                        className="form-select border-2"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      >
                        <option value="All">All Categories</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Family">Family</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        className="form-control border-2"
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        className="form-control border-2"
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <button
                        type="submit"
                        className="btn btn-warning w-100 py-2 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                      >
                        <i className="bi bi-search"></i>
                        <span>Search Rooms</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-warning fw-bold text-uppercase small tracking-wider">
                Signature Accommodations
              </span>
              <h2 className="display-6 fw-bold font-serif text-dark mb-0">
                Featured Rooms & Suites
              </h2>
            </div>
            <Link
              to="/rooms"
              className="btn btn-outline-dark rounded-pill px-4 mt-3 mt-md-0 fw-semibold"
            >
              Browse All Rooms <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading suites...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <RoomCard room={room} fromDate={checkIn} toDate={checkOut} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Luxury Amenities Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="text-warning fw-bold text-uppercase small tracking-wider">
              Exclusive Privileges
            </span>
            <h2 className="display-6 fw-bold font-serif text-dark">
              Crafted For Ultimate Indulgence
            </h2>
            <p className="text-muted">
              Every detail is meticulously curated to elevate your hospitality experience to new heights.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3 col-sm-6">
              <div className="p-4 rounded-4 bg-light h-100 feature-box transition-all">
                <div className="icon-badge bg-warning text-dark mx-auto mb-3">
                  <i className="bi bi-cup-hot-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark font-serif">Michelin Dining</h5>
                <p className="text-muted small mb-0">
                  World-renowned master chefs serving artisanal international cuisine around the clock.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 rounded-4 bg-light h-100 feature-box transition-all">
                <div className="icon-badge bg-warning text-dark mx-auto mb-3">
                  <i className="bi bi-water fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark font-serif">Rooftop Infinity Pool</h5>
                <p className="text-muted small mb-0">
                  Temperature-regulated skyline pool with private cabanas and cocktail lounge service.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 rounded-4 bg-light h-100 feature-box transition-all">
                <div className="icon-badge bg-warning text-dark mx-auto mb-3">
                  <i className="bi bi-flower1 fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark font-serif">Serenity Spa</h5>
                <p className="text-muted small mb-0">
                  Holistic therapeutic massages, Swedish saunas, and organic botanical skin treatments.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 rounded-4 bg-light h-100 feature-box transition-all">
                <div className="icon-badge bg-warning text-dark mx-auto mb-3">
                  <i className="bi bi-person-badge-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark font-serif">24/7 Butler Service</h5>
                <p className="text-muted small mb-0">
                  Dedicated personal concierge catering to your every flight, reservation, or tour need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section className="py-5 bg-dark text-white">
        <div className="container py-4 text-center">
          <span className="text-warning fw-bold text-uppercase small tracking-wider">
            Guest Testimonials
          </span>
          <h2 className="display-6 fw-bold font-serif mb-5">
            What Our Distinguished Guests Say
          </h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card bg-secondary bg-opacity-25 border-0 rounded-4 p-4 text-start h-100">
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                </div>
                <p className="fst-italic text-light text-opacity-90 flex-grow-1">
                  "The Penthouse Suite at HotelPro exceeded every standard of luxury. The staff anticipated every need before we even voiced it."
                </p>
                <div className="d-flex align-items-center gap-3 mt-3">
                  <div className="avatar-circle bg-warning text-dark fw-bold">VC</div>
                  <div>
                    <h6 className="mb-0 fw-bold">Victoria Crawford</h6>
                    <small className="text-muted">Executive Traveler</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-secondary bg-opacity-25 border-0 rounded-4 p-4 text-start h-100">
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                </div>
                <p className="fst-italic text-light text-opacity-90 flex-grow-1">
                  "Effortless booking, pristine rooms, and an unforgettable view. HotelPro has become our mandatory destination whenever we travel."
                </p>
                <div className="d-flex align-items-center gap-3 mt-3">
                  <div className="avatar-circle bg-warning text-dark fw-bold">DL</div>
                  <div>
                    <h6 className="mb-0 fw-bold">David & Lauren Vance</h6>
                    <small className="text-muted">Anniversary Guests</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-secondary bg-opacity-25 border-0 rounded-4 p-4 text-start h-100">
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                  <i className="bi bi-star-fill ms-1"></i>
                </div>
                <p className="fst-italic text-light text-opacity-90 flex-grow-1">
                  "The automated management and booking confirmation made our global summit coordination flawless. True perfection."
                </p>
                <div className="d-flex align-items-center gap-3 mt-3">
                  <div className="avatar-circle bg-warning text-dark fw-bold">RK</div>
                  <div>
                    <h6 className="mb-0 fw-bold">Rajesh Kapoor</h6>
                    <small className="text-muted">Global Conference Host</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
