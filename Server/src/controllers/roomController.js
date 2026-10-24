const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms with optional filtering (type, price, search, date availability)
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, search, fromDate, toDate } = req.query;

    const filter = {};

    // Filter by type
    if (type && type !== 'All') {
      filter.type = type;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Filter by keyword search (room number or description)
    if (search && search.trim()) {
      filter.$or = [
        { roomNumber: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by availability for specific check-in / check-out dates
    if (fromDate && toDate) {
      const checkIn = new Date(fromDate);
      const checkOut = new Date(toDate);

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fromDate or toDate format',
        });
      }

      if (checkOut <= checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date',
        });
      }

      // Find rooms with overlapping confirmed bookings
      // Overlap formula: booking.fromDate < checkOut AND booking.toDate > checkIn
      const overlappingBookings = await Booking.find({
        status: 'confirmed',
        fromDate: { $lt: checkOut },
        toDate: { $gt: checkIn },
      }).select('roomId');

      const unavailableRoomIds = overlappingBookings.map((b) => b.roomId);
      if (unavailableRoomIds.length > 0) {
        filter._id = { $nin: unavailableRoomIds };
      }
    }

    const rooms = await Room.find(filter).sort({ price: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room details by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Fetch upcoming confirmed bookings for this room so client can show disabled dates
    const upcomingBookings = await Booking.find({
      roomId: room._id,
      status: 'confirmed',
      toDate: { $gte: new Date() },
    }).select('fromDate toDate');

    res.status(200).json({
      success: true,
      room,
      bookedDateRanges: upcomingBookings.map((b) => ({
        fromDate: b.fromDate,
        toDate: b.toDate,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private / Admin
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, description, price, photos, features, isAvailable } = req.body;

    if (!roomNumber || !type || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, type, description, and price',
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    const normalizedRoomNumber = String(roomNumber).trim().toUpperCase();

    // Check duplicate room number
    const existingRoom = await Room.findOne({ roomNumber: normalizedRoomNumber });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: `Room number '${normalizedRoomNumber}' already exists. Please choose a unique room number.`,
      });
    }

    // Parse features if string
    let parsedFeatures = features;
    if (typeof features === 'string') {
      parsedFeatures = features.split(',').map((f) => f.trim()).filter(Boolean);
    }

    // Parse photos if string
    let parsedPhotos = photos;
    if (typeof photos === 'string') {
      parsedPhotos = photos.split(',').map((p) => p.trim()).filter(Boolean);
    }

    const room = await Room.create({
      roomNumber: normalizedRoomNumber,
      type,
      description: description.trim(),
      price: Number(price),
      photos: Array.isArray(parsedPhotos) ? parsedPhotos : [],
      features: Array.isArray(parsedFeatures) && parsedFeatures.length > 0 ? parsedFeatures : undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private / Admin
const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, description, price, photos, features, isAvailable } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // If changing room number, check uniqueness
    if (roomNumber) {
      const normalizedRoomNumber = String(roomNumber).trim().toUpperCase();
      if (normalizedRoomNumber !== room.roomNumber) {
        const duplicate = await Room.findOne({ roomNumber: normalizedRoomNumber });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: `Room number '${normalizedRoomNumber}' is already taken by another room.`,
          });
        }
        room.roomNumber = normalizedRoomNumber;
      }
    }

    if (type) room.type = type;
    if (description) room.description = description.trim();
    if (price !== undefined) {
      if (Number(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0',
        });
      }
      room.price = Number(price);
    }

    if (photos !== undefined) {
      let parsedPhotos = photos;
      if (typeof photos === 'string') {
        parsedPhotos = photos.split(',').map((p) => p.trim()).filter(Boolean);
      }
      room.photos = Array.isArray(parsedPhotos) ? parsedPhotos : [];
    }

    if (features !== undefined) {
      let parsedFeatures = features;
      if (typeof features === 'string') {
        parsedFeatures = features.split(',').map((f) => f.trim()).filter(Boolean);
      }
      room.features = Array.isArray(parsedFeatures) ? parsedFeatures : [];
    }

    if (isAvailable !== undefined) {
      room.isAvailable = Boolean(isAvailable);
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private / Admin
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if there are future active bookings for this room
    const activeBookings = await Booking.countDocuments({
      roomId: room._id,
      status: 'confirmed',
      toDate: { $gte: new Date() },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room '${room.roomNumber}' because it has ${activeBookings} upcoming confirmed reservation(s). Cancel the bookings first or set the room availability to inactive.`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Room '${room.roomNumber}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
