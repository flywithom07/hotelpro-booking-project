const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All booking routes require authentication
router.use(verifyToken);

// Customer bookings
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

// Admin-only: list all bookings across all users
router.get('/', requireAdmin, getAllBookings);

module.exports = router;
