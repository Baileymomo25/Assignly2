const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/requests');
const paymentRoutes = require('./routes/payments');
const { testConnection } = require('./config/database'); // Import test function

const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS
// Configure CORS - Allow all origins for mobile app
app.use(cors({
  origin: '*',  // This allows requests from your Android app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Test database connection (non-blocking)
testConnection().then(success => {
  if (success) {
    console.log('✅ Database is ready');
  } else {
    console.log('⚠️ Database not available, but server is running');
  }
});

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Debug endpoint
app.post('/api/debug', (req, res) => {
  console.log('Debug request received:', req.body);
  res.json({ 
    message: 'Debug endpoint working', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: https://assignly2.onrender.com/api/health`);
});
