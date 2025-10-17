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

  // Properly handle JSON conversion
  let priceBreakdownJson = null;
  if (priceBreakdown && Array.isArray(priceBreakdown)) {
    try {
      priceBreakdownJson = JSON.stringify(priceBreakdown);
    } catch (error) {
      console.error('Error stringifying priceBreakdown:', error);
      priceBreakdownJson = '[]';
    }
  }

  const query = `
    INSERT INTO requests (
      full_name, email, phone, work_type, deadline, notes, files,
      page_count, diagram_count, delivery_type, total_price, price_breakdown,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING *
  `;

  const values = [
    fullName,
    email,
    phone,
    workType,
    deadline,
    notes,
    JSON.stringify(files || []),
    pageCount,
    diagramCount || 0,
    deliveryType,
    totalPrice,
    priceBreakdownJson
  ];

  console.log('Executing query with values:', values);

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in createRequest:', error);
    throw error;
  }
};

const updateRequestPayment = async (requestId, paymentData) => {
  const { transactionId, amount, status } = paymentData;
  
  const query = `
    UPDATE requests 
    SET payment_status = $1, transaction_id = $2, amount_paid = $3, paid_at = NOW()
    WHERE id = $4
    RETURNING *
  `;

  const values = [status, transactionId, amount, requestId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in updateRequestPayment:', error);
    throw error;
  }
};

const getRequestById = async (id) => {
  const query = 'SELECT * FROM requests WHERE id = $1';
  
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in getRequestById:', error);
    throw error;
  }
};

module.exports = {
  createRequest,
  updateRequestPayment,
  getRequestById
};
