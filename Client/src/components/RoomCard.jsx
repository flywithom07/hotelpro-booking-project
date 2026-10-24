import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

const RoomCard = ({ room, fromDate, toDate }) => {
  const imageUrl =
    room.photos && room.photos.length > 0 && room.photos[0].trim()
      ? room.photos[0]
      : DEFAULT_IMAGE;

  // Preserve selected date filters in URL params when navigating to room details!
  const queryParams = new URLSearchParams();
  if (fromDate) queryParams.set('fromDate', fromDate);
  if (toDate) queryParams.set('toDate', toDate);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return (
    <div className="card h-100 shadow-sm border-0 room-card overflow-hidden rounded-4 transition-all">
      <div className="position-relative room-image-wrapper">
        <img
          src={imageUrl}
          alt={`Room ${room.roomNumber} - ${room.type}`}
          className="card-img-top room-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
          <span className="badge bg-dark bg-opacity-75 backdrop-blur px-3 py-2 rounded-pill fw-semibold">
            Room {room.roomNumber}
          </span>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            {room.type}
          </span>
        </div>
        <div className="position-absolute bottom-0 end-0 m-3">
          <span className="badge bg-light text-dark shadow-sm px-3 py-2 rounded-pill fs-6 fw-bold">
            ${room.price} <span className="small fw-normal text-muted">/ night</span>
          </span>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title fw-bold text-dark font-serif mb-2">
          {room.type} Suite — Room {room.roomNumber}
        </h5>
        <p className="card-text text-muted small flex-grow-1 line-clamp-2 mb-3">
          {room.description}
        </p>

        {/* Feature Tags */}
        <div className="d-flex flex-wrap gap-1 mb-4">
          {room.features && room.features.slice(0, 3).map((feat, idx) => (
            <span key={idx} className="badge bg-light text-secondary border rounded-pill px-2 py-1 small">
              <i className="bi bi-check2 text-success me-1"></i>
              {feat}
            </span>
          ))}
          {room.features && room.features.length > 3 && (
            <span className="badge bg-light text-muted border rounded-pill px-2 py-1 small">
              +{room.features.length - 3} more
            </span>
          )}
        </div>

        <div className="d-grid mt-auto">
          <Link
            to={`/rooms/${room._id}${queryString}`}
            className="btn btn-dark rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 hover-lift"
          >
            <span>View Details & Book</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
