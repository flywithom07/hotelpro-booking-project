const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      index: true,
    },
    fromDate: {
      type: Date,
      required: [true, 'Check-in date (fromDate) is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'Check-out date (toDate) is required'],
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days is required'],
      min: [1, 'Total days must be at least 1'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total booking amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'confirmed',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high-performance overlapping booking checks
bookingSchema.index({ roomId: 1, status: 1, fromDate: 1, toDate: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
