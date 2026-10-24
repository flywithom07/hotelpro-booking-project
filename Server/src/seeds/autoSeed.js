const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    const roomCount = await Room.countDocuments();

    if (userCount > 0 && roomCount > 0) {
      return; // Database is already populated
    }

    console.log('[AutoSeed] Empty database detected. Seeding initial hotel inventory & accounts...');

    let adminUser, customerUser;

    if (userCount === 0) {
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@hotelpro.com',
        password: 'AdminPassword123!',
        phone: '+1 555-0100',
        userType: 'admin',
      });

      customerUser = await User.create({
        name: 'Eleanor Vance',
        email: 'customer@hotelpro.com',
        password: 'CustomerPass123!',
        phone: '+1 555-0123',
        userType: 'ordinary',
      });

      console.log('[AutoSeed] Created default Administrator and Customer.');
    }

    let createdRooms = [];
    if (roomCount === 0) {
      const roomsData = [
        {
          roomNumber: '101',
          type: 'Single',
          price: 95,
          description:
            'A cozy and elegant room designed for solo travelers or business professionals, featuring high-speed fiber Wi-Fi and ergonomic workstation.',
          features: ['High-speed Wi-Fi', 'Workstation', 'Air Conditioning', 'Smart TV', 'Private Bathroom'],
          photos: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          ],
          isAvailable: true,
        },
        {
          roomNumber: '102',
          type: 'Double',
          price: 150,
          description:
            'Spacious comfort with a plush Queen-size bed, private city-view balcony, coffee bar, and designer rainfall shower.',
          features: ['Queen Bed', 'Balcony', 'City View', 'Rainfall Shower', 'Coffee Bar', 'Smart TV'],
          photos: [
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          ],
          isAvailable: true,
        },
        {
          roomNumber: '201',
          type: 'Deluxe',
          price: 240,
          description:
            'Sophisticated luxury featuring a King-size bed, panoramic skyline windows, deep soaking marble tub, and dedicated evening turn-down service.',
          features: ['King Bed', 'Skyline View', 'Marble Soaking Tub', 'Mini Bar', 'Bathrobes & Slippers', 'Premium Sound'],
          photos: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          ],
          isAvailable: true,
        },
        {
          roomNumber: '301',
          type: 'Suite',
          price: 380,
          description:
            'Executive Penthouse Suite offering separate living and dining quarters, private whirlpool spa terrace, 24/7 personal butler service, and complimentary champagne.',
          features: ['Private Terrace', 'Whirlpool Spa', 'Dining Area', 'Butler Service', 'Champagne Bar', 'Walk-in Closet'],
          photos: [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          ],
          isAvailable: true,
        },
        {
          roomNumber: '205',
          type: 'Family',
          price: 280,
          description:
            'Generous family retreat with two connected Queen rooms, kid-friendly entertainment amenities, double vanity bathroom, and mini kitchen.',
          features: ['2 Queen Beds', 'Connecting Layout', 'Kitchenette', 'Game Console', 'Double Vanity', 'Crib on Request'],
          photos: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          ],
          isAvailable: true,
        },
      ];

      createdRooms = await Room.insertMany(roomsData);
      console.log(`[AutoSeed] Created ${createdRooms.length} sample rooms.`);
    }

    if (customerUser && createdRooms.length > 0) {
      const now = new Date();
      const futureIn = new Date(now);
      futureIn.setDate(now.getDate() + 3);
      const futureOut = new Date(now);
      futureOut.setDate(now.getDate() + 6);

      await Booking.create({
        userId: customerUser._id,
        roomId: createdRooms[2]._id,
        fromDate: futureIn,
        toDate: futureOut,
        totalDays: 3,
        totalAmount: createdRooms[2].price * 3,
        phone: customerUser.phone,
        status: 'confirmed',
      });
      console.log('[AutoSeed] Created initial sample reservation.');
    }
  } catch (err) {
    console.error('[AutoSeed] Failed to auto-seed initial data:', err.message);
  }
};

module.exports = autoSeedIfEmpty;
