const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // OPTIMIZATION: Trust the token for ID, Gym, and Role.
    // This saves 1 DB call on every single request across all 20 gyms.
    if (decoded.gymId) {
      req.user = {
        _id: decoded.userId,
        gymId: decoded.gymId,
        role: decoded.role,
        isActive: true // Assume active if token is valid (token expires in 15m)
      };
      return next();
    }

    // Fallback for older tokens or specific cases
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshToken');
    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or inactive', 401);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Role '${req.user.role}' is not authorized`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
