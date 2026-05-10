const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware — restricts route access to superadmin role only.
 * Must run AFTER auth middleware.
 */
const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return errorResponse(res, 'Access denied. Super admin only.', 403);
  }
  next();
};

module.exports = { superAdminOnly };
