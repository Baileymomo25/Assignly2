const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/requests');
const paymentRoutes = require('./routes/payments');

const app = express();
const port = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow requests from localhost during development
    if (origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // Allow requests from your production frontend domain
    if (origin.startsWith('https://assignly5.vercel.app')) {
      return callback(null, true);
    }
    
    // Block other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase payload limit for file uploads

// Enable CORS for your Vercel frontend
app.use(cors({
  origin: [
    'https://assignly5.vercel.app', // Your Vercel URL
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));
// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
// In your main server file (app.js or index.js)
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
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
