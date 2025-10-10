const express = require('express');
const router = express.Router();
const db = require('../database'); // Adjust path if needed

router.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'success',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('DB test failed:', error);
    res.status(500).json({ status: 'error', message: 'Database test failed' });
  }
});

module.exports = router;

