const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

const generateToken = ({ userId, email, role }) => {
  const payload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
