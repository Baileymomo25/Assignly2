const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/requests');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 10000;

// Simple CORS configuration - use this instead of your current complex one
app.use(cors({
  origin: [
    'https://assignly5.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test endpoint for debugging
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
  console.log(`Frontend should connect to: https://assignly2.onrender.com`);
});
