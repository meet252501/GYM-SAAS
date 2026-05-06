const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    message = `Invalid ID format`;
    statusCode = 400;
  }

  console.error(`[ERROR] ${err.stack || err.message}`);
  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
