const { errorResponse } = require('../utils/response');

const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return errorResponse(res, 'Authenticated user required', 403);
  }

  const userRole = req.user.role;
  if (!allowedRoles.includes(userRole)) {
    return errorResponse(res, 'Insufficient permissions', 403);
  }

  return next();
};

module.exports = roleMiddleware;
