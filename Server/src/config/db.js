const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Ensure environment variables are loaded from Server/.env regardless of CWD
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Fix for Windows Node.js c-ares bug:
// If local loopback (127.0.0.1) is the only or primary DNS resolver in Node.js,
// SRV lookups for mongodb+srv:// fail with querySrv ECONNREFUSED.
// Falling back to standard public DNS resolvers (Google / Cloudflare) resolves this reliably.
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.includes('127.0.0.1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (dnsErr) {
  // Silently ignore if permissions or environment restrict dns.setServers
}

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Check if an explicit in-memory DB is requested (strictly for isolated unit testing)
  const isExplicitMemoryDB = process.env.USE_MEMORY_DB === 'true';

  if (!uri && !isExplicitMemoryDB) {
    console.error('[Database Error] MONGODB_URI is not configured in Server/.env');
    console.error('[Database Error] Please set a valid MongoDB Atlas connection string in Server/.env');
    throw new Error('MONGODB_URI is missing');
  }

  // If in-memory is explicitly requested for testing:
  if (isExplicitMemoryDB) {
    if (!process.env.MONGOMS_DOWNLOAD_DIR) {
      process.env.MONGOMS_DOWNLOAD_DIR = path.resolve('D:/.mongo-binaries');
    }
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      binary: { version: '6.0.14' },
    });
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri, { dbName: 'hotelpro' });
    console.log(`[Database] Connected to isolated test in-memory MongoDB (${conn.connection.name})`);
    return conn;
  }

  // Connect to configured database (MongoDB Atlas or configured MONGODB_URI)
  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'hotelpro', // Ensure hotelpro database is always used
      serverSelectionTimeoutMS: 10000,
    });

    console.log('[Database] MongoDB Atlas connection established successfully.');
    console.log(`[Database] Cluster Host: ${conn.connection.host}`);
    console.log(`[Database] Active Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    // Sanitize any potential credentials from error message before logging
    const safeError = err.message.replace(
      /mongodb(\+srv)?:\/\/[^@\s]+@/gi,
      'mongodb$1://<credentials-hidden>@'
    );

    console.error('[Database Error] Failed to connect to configured MongoDB database:');
    console.error(`[Database Error] Details: ${safeError}`);

    // If an Atlas host was configured, provide troubleshooting guidance
    if (uri && uri.includes('mongodb.net')) {
      console.error('\n[Atlas Troubleshooting Guide]');
      console.error('1. Check Network Access in Atlas: Ensure your current IP is added to the IP Access List (or 0.0.0.0/0 for global access during testing).');
      console.error('2. Check Database Access: Verify that username "hotelpro_user" and password in Server/.env match your Atlas user.');
      console.error('3. Check URI format: Ensure password special characters are URL-encoded if applicable (e.g., "@" as "%40").\n');
    }

    // Do NOT silently fall back to in-memory database. Fail fast so the user knows.
    throw err;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
