import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-icon bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center">
                <i className="bi bi-building fs-5"></i>
              </div>
              <span className="fs-4 fw-bold font-serif">HOTEL<span className="text-warning">PRO</span></span>
            </div>
            <p className="text-muted small pe-lg-4">
              HotelPro provides seamless luxury hospitality, high-end guest reservations, and comprehensive management designed for five-star comfort and operations.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <a href="#facebook" className="text-secondary hover-gold"><i className="bi bi-facebook fs-5"></i></a>
              <a href="#instagram" className="text-secondary hover-gold"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#twitter" className="text-secondary hover-gold"><i className="bi bi-twitter-x fs-5"></i></a>
              <a href="#linkedin" className="text-secondary hover-gold"><i className="bi bi-linkedin fs-5"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3">Quick Links</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none hover-gold">Home</Link></li>
              <li><Link to="/rooms" className="text-secondary text-decoration-none hover-gold">Rooms & Suites</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-gold">Guest Portal</Link></li>
              <li><Link to="/register" className="text-secondary text-decoration-none hover-gold">Create Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3">Room Categories</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
              <li><Link to="/rooms?type=Single" className="text-secondary text-decoration-none hover-gold">Single Executive</Link></li>
              <li><Link to="/rooms?type=Double" className="text-secondary text-decoration-none hover-gold">Deluxe Double</Link></li>
              <li><Link to="/rooms?type=Deluxe" className="text-secondary text-decoration-none hover-gold">Luxury Deluxe Suite</Link></li>
              <li><Link to="/rooms?type=Suite" className="text-secondary text-decoration-none hover-gold">Presidential Suite</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3">Contact Concierge</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
              <li><i className="bi bi-geo-alt-fill text-warning me-2"></i> 777 Grand Boulevard, Metropolis</li>
              <li><i className="bi bi-telephone-fill text-warning me-2"></i> +1 (800) 555-HOTEL</li>
              <li><i className="bi bi-envelope-fill text-warning me-2"></i> concierge@hotelpro.com</li>
              <li><i className="bi bi-clock-fill text-warning me-2"></i> 24/7 Front Desk & Concierge</li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted small">
          <p className="mb-0">© {new Date().getFullYear()} HotelPro Management System. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <span className="text-secondary">Privacy Policy</span>
            <span>•</span>
            <span className="text-secondary">Terms of Service</span>
            <span>•</span>
            <span className="text-secondary">Security Audit Approved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
