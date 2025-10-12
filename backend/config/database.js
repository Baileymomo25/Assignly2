const { Pool } = require('pg');
require('dotenv').config();

// Validate database URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Parse the database URL and force SSL
const connectionString = process.env.DATABASE_URL;

// For Render PostgreSQL, we need to ensure SSL is properly configured
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  connectionTimeoutMillis: 15000,
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
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connection verified');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query test successful:', result.rows[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // More detailed error information
    if (error.code === '28000') {
      console.log('🔧 SSL/TLS connection required. Check database SSL settings.');
    }
    
    console.log('Server will continue running, but database features may not work');
    
    // Make sure to release client if it was acquired
    if (client) {
      client.release();
    }
    return false;
  }
};

// Export both pool and test function
module.exports = {
  pool,
  testConnection
};
