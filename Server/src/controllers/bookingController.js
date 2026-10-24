const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Create a new room booking
// @route   POST /api/bookings
// @access  Private (Authenticated User)
const createBooking = async (req, res, next) => {
  try {
    const { roomId, fromDate, toDate, phone } = req.body;

    // 1. Validate required inputs
    if (!roomId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, check-in date (fromDate), and check-out date (toDate)',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format',
      });
    }

    const contactPhone = phone || req.user.phone;
    if (!contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Contact phone number is required for booking',
      });
    }

    // 2. Validate dates
    const checkIn = new Date(fromDate);
    const checkOut = new Date(toDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for check-in or check-out',
      });
    }

    // Normalized today (beginning of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDateOnly = new Date(checkIn);
    checkInDateOnly.setHours(0, 0, 0, 0);

    if (checkInDateOnly < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after the check-in date',
      });
    }

    // 3. Fetch Room & verify availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Selected room does not exist',
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is currently unavailable for reservations`,
      });
    }

    // 4. Overlap Check: Prevent overlapping confirmed bookings for the same room
    // Overlap condition: (existing.fromDate < new.toDate) AND (existing.toDate > new.fromDate)
    const conflictBooking = await Booking.findOne({
      roomId: room._id,
      status: 'confirmed',
      fromDate: { $lt: checkOut },
      toDate: { $gt: checkIn },
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: `Room ${room.roomNumber} is already booked for the selected dates (${conflictBooking.fromDate.toISOString().split('T')[0]} to ${conflictBooking.toDate.toISOString().split('T')[0]}). Please choose different dates.`,
      });
    }

    // 5. Server-side Calculation of Total Days & Total Amount
    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const totalDays = Math.ceil(diffTime / oneDayMs);

    if (totalDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'A booking must be for at least 1 night',
      });
    }

    const totalAmount = totalDays * room.price;

    // 6. Create Booking
    const booking = await Booking.create({
      userId: req.user._id,
      roomId: room._id,
      fromDate: checkIn,
      toDate: checkOut,
      totalDays,
      totalAmount,
      phone: contactPhone.trim(),
      status: 'confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('roomId', 'roomNumber type price photos description features')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of the currently logged-in user
// @route   GET /api/bookings/my
// @access  Private (Authenticated User)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('roomId', 'roomNumber type price photos description features isAvailable')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Booking Owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(id).populate('roomId', 'roomNumber type');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization: Must be owner of booking OR admin
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel this reservation',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking for Room ${booking.roomId?.roomNumber || ''} has been cancelled successfully. The room dates are now freed for new reservations.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private / Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['confirmed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone userType')
      .populate('roomId', 'roomNumber type price photos')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
