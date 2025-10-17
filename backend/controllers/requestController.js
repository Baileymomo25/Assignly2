const { createRequest, getRequestById } = require('../models/request');
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format'
      });
    }

    // Validate numeric fields
    if (pageCount < 1) {
      return res.status(400).json({ 
        error: 'Page count must be at least 1'
      });
    }

    if (diagramCount < 0) {
      return res.status(400).json({ 
        error: 'Diagram count cannot be negative'
      });
    }

    // Validate deadline is not in the past
    if (new Date(deadline) < new Date()) {
      return res.status(400).json({ 
        error: 'Deadline cannot be in the past'
      });
    }

    // Create request in database
    const requestData = {
      fullName,
      email,
      phone,
      workType,
      deadline,
      notes: notes || '',
      files: files || [],
      pageCount,
      diagramCount: diagramCount || 0,
      deliveryType: deliveryType || 'soft_copy',
      totalPrice,
      priceBreakdown: priceBreakdown || []
    };

    console.log('Creating request with data:', requestData);

    const newRequest = await createRequest(requestData);
    
    console.log('Request created successfully:', newRequest.id);

    // Send notification emails (non-blocking with better error handling)
    sendNewRequestEmail(newRequest).then(() => {
      console.log('Admin notification email sent successfully');
    }).catch(emailError => {
      console.error('Failed to send admin email:', emailError);
    });
    
    sendConfirmationEmail(newRequest).then(() => {
      console.log('Customer confirmation email sent successfully');
    }).catch(emailError => {
      console.error('Failed to send confirmation email:', emailError);
    });
    
    res.status(201).json({
      message: 'Request submitted successfully',
      requestId: newRequest.id,
      totalPrice: newRequest.total_price
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    
    // More specific error messages
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Duplicate request detected'
      });
    }
    
    if (error.code === '23502') {
      return res.status(400).json({ 
        error: 'Required field missing'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const request = await getRequestById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ 
      request: {
        ...request,
        // Ensure price is properly formatted
        totalPrice: request.total_price,
        priceBreakdown: request.price_breakdown ? JSON.parse(request.price_breakdown) : []
      }
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  submitRequest,
  getRequest
};
