import React from 'react';

const AlertMessage = ({ variant = 'danger', message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${variant} alert-dismissible fade show shadow-sm border-0`}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i
          className={`bi ${
            variant === 'danger'
              ? 'bi-exclamation-triangle-fill text-danger'
              : variant === 'success'
              ? 'bi-check-circle-fill text-success'
              : 'bi-info-circle-fill text-primary'
          } me-2 fs-5`}
        ></i>
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
