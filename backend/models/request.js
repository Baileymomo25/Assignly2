const pool = require('../config/database');

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
  return result.rows[0];
};

const getRequestById = async (id) => {
  const result = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = {
  createRequest,
  getRequestById
};
