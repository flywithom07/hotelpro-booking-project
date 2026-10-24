const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get all registered users (Admin only)
// @route   GET /api/admin/users
// @access  Private / Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRooms, totalBookings, confirmedBookings, cancelledBookings] =
      await Promise.all([
        User.countDocuments(),
        Room.countDocuments(),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.countDocuments({ status: 'cancelled' }),
      ]);

    // Calculate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Fetch 5 most recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber type price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRooms,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAdminStats,
};
