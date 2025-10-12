const { Pool } = require('pg');
require('dotenv').config();

// Validate database URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Parse the database URL to add SSL parameters
let connectionString = process.env.DATABASE_URL;

// Add SSL parameters to the connection string
if (process.env.NODE_ENV === 'production') {
  if (connectionString.includes('?')) {
    connectionString += '&sslmode=require';
  } else {
    connectionString += '?sslmode=require';
  }
}

console.log('Database URL:', connectionString.replace(/:[^:]*@/, ':****@')); // Hide password in logs

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Test the connection (but don't crash if it fails initially)
pool.on('connect', (client) => {
  console.log('Database connected successfully');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err.message);
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
