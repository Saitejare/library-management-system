const { body, query } = require('express-validator');

const createBookValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('quantity').isInt({ min: 0 }).withMessage('quantity must be an integer >= 0'),
  body('availableQuantity').isInt({ min: 0 }).withMessage('availableQuantity must be an integer >= 0'),
];

const updateBookValidation = [
  body('title').optional().notEmpty().withMessage('Title must not be empty'),
  body('author').optional().notEmpty().withMessage('Author must not be empty'),
  body('isbn').optional().notEmpty().withMessage('ISBN must not be empty'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('quantity must be an integer >= 0'),
  body('availableQuantity').optional().isInt({ min: 0 }).withMessage('availableQuantity must be an integer >= 0'),
];

const listBooksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer >= 1'),
  query('limit').optional().isInt({ min: 1 }).withMessage('limit must be an integer >= 1'),
  query('sortBy').optional().isIn(['title', 'author', 'publishedYear', 'createdAt']).withMessage('Invalid sortBy value'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('status').optional().isIn(['Available', 'Unavailable']).withMessage('Invalid status value'),
  query('year').optional().isInt().withMessage('year must be an integer'),
];

module.exports = {
  createBookValidation,
  updateBookValidation,
  listBooksValidation,
};
