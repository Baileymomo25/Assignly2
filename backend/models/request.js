const { pool } = require('../config/database');

const createRequest = async (requestData) => {
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
  } = requestData;

  // Convert priceBreakdown to proper JSON string
  let priceBreakdownJson = null;
  if (priceBreakdown && Array.isArray(priceBreakdown)) {
    try {
      priceBreakdownJson = JSON.stringify(priceBreakdown);
    } catch (error) {
      console.error('Error stringifying priceBreakdown:', error);
      // If stringify fails, set to empty array
      priceBreakdownJson = '[]';
    }
  }

  const query = `
    INSERT INTO requests (
      full_name, email, phone, work_type, deadline, notes, files,
      page_count, diagram_count, delivery_type, total_price, price_breakdown
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
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
    priceBreakdownJson  // Use the properly formatted JSON
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in createRequest:', error);
    throw error;
  }
};

const getRequestById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in getRequestById:', error);
    throw error;
  }
};

module.exports = {
  createRequest,
  getRequestById
};
