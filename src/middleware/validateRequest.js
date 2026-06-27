const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  return next();
};

module.exports = validateRequest;
