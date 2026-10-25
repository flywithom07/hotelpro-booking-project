const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const autoSeedIfEmpty = require('./seeds/autoSeed');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) or matching origin
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'HotelPro API',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

// Serve frontend static build if available
const clientDistPath = path.resolve(__dirname, '../../Client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 Route Handler for general routes when no client build exists
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Endpoint '${req.method} ${req.originalUrl}' not found`,
    });
  });
}

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    const server = app.listen(PORT, () => {
      console.log(`\n=============================================`);
      console.log(`  HOTELPRO SERVER RUNNING ON PORT ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API Health:  http://localhost:${PORT}/api/health`);
      console.log(`=============================================\n`);
    });
    return server;
  } catch (error) {
    const safeError = (error.message || '').replace(
      /mongodb(\+srv)?:\/\/[^@\s]+@/gi,
      'mongodb$1://<credentials-hidden>@'
    );
    console.error('\n[Server Error] Server aborted: Database connection could not be established.');
    console.error(`[Server Error] Reason: ${safeError}\n`);
    process.exit(1);
  }
};

// Start automatically if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
