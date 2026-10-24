const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify the room type'],
      enum: {
        values: ['Single', 'Double', 'Deluxe', 'Suite', 'Family'],
        message: '{VALUE} is not a supported room type',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide a room description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide the price per night'],
      min: [1, 'Price per night must be at least 1'],
    },
    photos: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Private Bathroom'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index on room type and availability
roomSchema.index({ type: 1, isAvailable: 1, price: 1 });

module.exports = mongoose.model('Room', roomSchema);
