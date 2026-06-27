const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = {
  verifyToken,
};
