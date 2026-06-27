const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token missing', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return errorResponse(res, 'Invalid token', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = authMiddleware;
