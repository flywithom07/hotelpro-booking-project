const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

let mongoServer;
let adminToken;
let customerToken;
let customer2Token;
let testRoomId;
let testBookingId;

process.env.MONGOMS_DOWNLOAD_DIR = 'D:/.mongo-binaries';

test.before(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '6.0.14' },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    // ignore disconnect error during shutdown
  }
  if (mongoServer) {
    try {
      await mongoServer.stop();
    } catch (err) {
      // ignore stop error during shutdown
    }
  }
});

test('1. Security: Public signup enforces userType "ordinary" and ignores "admin" escalation', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Hacker Attempt',
      email: 'hacker@example.com',
      password: 'SecretPassword123',
      phone: '+1 555-9999',
      userType: 'admin', // Malicious attempt to escalate role
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.userType, 'ordinary'); // Must be ordinary
  assert.equal(res.body.user.password, undefined); // Password never leaked
});

test('2. Security: Registration prevents duplicate emails', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Duplicate Guy',
      email: 'hacker@example.com',
      password: 'AnotherPassword123',
      phone: '+1 555-8888',
    });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
});

test('3. Auth: Login fails with invalid password', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'hacker@example.com',
      password: 'WrongPassword123',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('4. Auth: Setup Admin and Customer tokens', async () => {
  // Directly create an admin user in DB (simulating admin provisioning/seed)
  const admin = await User.create({
    name: 'Admin Boss',
    email: 'admin@hotelpro.test',
    password: 'AdminPassword123!',
    phone: '+1 555-0001',
    userType: 'admin',
  });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@hotelpro.test',
      password: 'AdminPassword123!',
    });

  assert.equal(adminLogin.status, 200);
  assert.ok(adminLogin.body.token);
  assert.equal(adminLogin.body.user.userType, 'admin');
  adminToken = adminLogin.body.token;

  // Login ordinary customer
  const custLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'hacker@example.com',
      password: 'SecretPassword123',
    });

  assert.equal(custLogin.status, 200);
  customerToken = custLogin.body.token;

  // Create second customer for unauthorized test
  const cust2 = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Customer Two',
      email: 'cust2@example.com',
      password: 'Password123',
      phone: '+1 555-2222',
    });
  customer2Token = cust2.body.token;
});

test('5. Auth: Protected route /api/auth/me returns current user', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${customerToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, 'hacker@example.com');
  assert.equal(res.body.user.password, undefined);
});

test('6. Room: Ordinary user cannot create a room (403 Forbidden)', async () => {
  const res = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      roomNumber: '999',
      type: 'Deluxe',
      price: 200,
      description: 'Unauthorized Room',
    });

  assert.equal(res.status, 403);
});

test('7. Room: Admin can create room and duplicate room numbers are rejected', async () => {
  const res = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      roomNumber: '101',
      type: 'Deluxe',
      price: 150,
      description: 'Luxury ocean room with king bed',
      features: ['Wi-Fi', 'King Bed', 'Ocean View'],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.room.roomNumber, '101');
  testRoomId = res.body.room._id;

  // Attempt duplicate room number
  const dupRes = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      roomNumber: '101',
      type: 'Single',
      price: 80,
      description: 'Duplicate room test',
    });

  assert.equal(dupRes.status, 409);
});

test('8. Room: Public can list rooms', async () => {
  const res = await request(app).get('/api/rooms');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.rooms));
  assert.equal(res.body.rooms.length >= 1, true);
});

test('9. Booking: Date validation rejects past check-in and checkout <= checkin', async () => {
  // Check-in in past
  const pastRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      roomId: testRoomId,
      fromDate: '2020-01-01',
      toDate: '2020-01-05',
    });
  assert.equal(pastRes.status, 400);

  // Checkout before checkin
  const invalidDateRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      roomId: testRoomId,
      fromDate: '2027-05-10',
      toDate: '2027-05-08',
    });
  assert.equal(invalidDateRes.status, 400);
});

test('10. Booking: Server correctly calculates totalDays and totalAmount', async () => {
  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      roomId: testRoomId,
      fromDate: '2027-06-01',
      toDate: '2027-06-04', // 3 nights @ 150/night = 450
      phone: '+1 555-9999',
      totalAmount: 1, // Malicious client price override attempt!
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.booking.totalDays, 3);
  assert.equal(res.body.booking.totalAmount, 450); // Server calculated: 3 * 150 = 450
  assert.equal(res.body.booking.status, 'confirmed');
  testBookingId = res.body.booking._id;
});

test('11. Booking: Overlapping reservation is strictly rejected (409 Conflict)', async () => {
  // Attempt booking overlapping June 2 to June 5
  const overlapRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customer2Token}`)
    .send({
      roomId: testRoomId,
      fromDate: '2027-06-02',
      toDate: '2027-06-05',
      phone: '+1 555-2222',
    });

  assert.equal(overlapRes.status, 409);
  assert.match(overlapRes.body.message, /already booked/i);
});

test('12. Booking: Unauthorized user cannot cancel another user booking (403 Forbidden)', async () => {
  const res = await request(app)
    .patch(`/api/bookings/${testBookingId}/cancel`)
    .set('Authorization', `Bearer ${customer2Token}`);

  assert.equal(res.status, 403);
});

test('13. Booking: Owner can cancel booking and freed dates can now be booked', async () => {
  // Cancel booking
  const cancelRes = await request(app)
    .patch(`/api/bookings/${testBookingId}/cancel`)
    .set('Authorization', `Bearer ${customerToken}`);

  assert.equal(cancelRes.status, 200);
  assert.equal(cancelRes.body.booking.status, 'cancelled');

  // Now, re-booking the exact same dates must succeed!
  const rebookRes = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customer2Token}`)
    .send({
      roomId: testRoomId,
      fromDate: '2027-06-01',
      toDate: '2027-06-04',
      phone: '+1 555-2222',
    });

  assert.equal(rebookRes.status, 201);
  assert.equal(rebookRes.body.booking.status, 'confirmed');
});

test('14. Admin: Ordinary user cannot access admin users list or stats', async () => {
  const usersRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${customerToken}`);
  assert.equal(usersRes.status, 403);

  const statsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${customerToken}`);
  assert.equal(statsRes.status, 403);
});

test('15. Admin: Admin can access users list and dashboard stats', async () => {
  const usersRes = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(usersRes.status, 200);
  assert.ok(usersRes.body.users.length >= 2);

  const statsRes = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(statsRes.status, 200);
  assert.ok(statsRes.body.stats.totalRooms >= 1);
  assert.ok(statsRes.body.stats.totalBookings >= 1);
});
