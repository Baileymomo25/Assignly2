const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/requests');
const paymentRoutes = require('./routes/payments');

const express = require('express');
const app = express();

const dbTestRoute = require('./routes/dbTest'); // Adjust path if needed
app.use('/', dbTestRoute);

const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS
app.use(cors({
  origin: [
    'https://assignly5.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Routes
// Add this route before your other routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
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
