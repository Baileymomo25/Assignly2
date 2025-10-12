const { createRequest } = require('../models/request');
const { sendNewRequestEmail, sendConfirmationEmail } = require('../utils/email');

const submitRequest = async (req, res) => {
  try {
    console.log('Request received:', req.body);
    
    const {
      fullName,
      email,
      phone,
      workType,
      deadline,
      notes,
      files,
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format'
      });
    }

    // Create request in database
    const requestData = {
      fullName,
      email,
      phone,
      workType,
      deadline,
      notes,
      files,
      pageCount,
      diagramCount,
      deliveryType,
      totalPrice,
      priceBreakdown
    };

    const newRequest = await createRequest(requestData);
    
    // Send notification emails (non-blocking)
    sendNewRequestEmail(newRequest).catch(emailError => {
      console.error('Failed to send admin email:', emailError);
    });
    
    sendConfirmationEmail(newRequest).catch(emailError => {
      console.error('Failed to send confirmation email:', emailError);
    });
    
    res.status(201).json({
      message: 'Request submitted successfully',
      requestId: newRequest.id
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitRequest,
  getRequest
};
