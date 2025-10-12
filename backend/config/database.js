const { Pool } = require('pg');
require('dotenv').config();

// Validate database URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add connection timeout
  connectionTimeoutMillis: 10000, // Increased timeout
  idleTimeoutMillis: 30000,
  max: 20
});

// Test the connection (but don't crash if it fails initially)
pool.on('connect', (client) => {
  console.log('Database connected successfully');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err.message);
  // Don't exit process on error, let the server continue
});

// Verify connection on startup (non-blocking)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection verified');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Server will continue running, but database features may not work');
    return false;
  }
};

// Export both pool and test function
module.exports = {
  pool,
  testConnection
};
