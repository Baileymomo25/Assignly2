const { createRequest } = require('../models/request');
const { sendNewRequestEmail, sendConfirmationEmail } = require('../utils/email');

// In your request controller
const submitRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      workType,
      deadline,
      notes,
      files,
      // New pricing fields
      pageCount,
      diagramCount,
      deliveryType,
      totalPrice,
      priceBreakdown
    } = req.body;

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'workType', 'deadline', 'pageCount', 'totalPrice'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Create request in database
    const query = `
      INSERT INTO requests (
        full_name, email, phone, work_type, deadline, notes, files,
        page_count, diagram_count, delivery_type, total_price, price_breakdown
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      fullName, email, phone, workType, deadline, notes, files,
      pageCount, diagramCount, deliveryType, totalPrice, priceBreakdown
    ];

    const result = await pool.query(query, values);
    const newRequest = result.rows[0];

    // Send notification emails
    sendNewRequestEmail(newRequest).catch(console.error);
    sendConfirmationEmail(newRequest).catch(console.error);

    res.status(201).json({
      message: 'Request submitted successfully',
      requestId: newRequest.id
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
