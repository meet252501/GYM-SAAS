/**
 * Standard API response helpers
 */
const successResponse = (res, data = {}, statusCode = 200, meta = null) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { successResponse, errorResponse };
