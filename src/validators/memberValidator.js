const { param, body, query } = require('express-validator');

const updateMeValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9\-\s]{7,20}$/)
    .withMessage('Phone must be a valid phone number'),
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
];

const listMembersValidation = [
  query('search').optional().isString().withMessage('Search must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt'])
    .withMessage('sortBy must be one of name, email, createdAt'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];

const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid member id'),
];

module.exports = {
  updateMeValidation,
  listMembersValidation,
  idParamValidation,
};
