const { errorResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return errorResponse(res, err.message || 'Server error', err.statusCode || 500);
};

module.exports = errorMiddleware;
