const { param, query } = require('express-validator');

const bookIdParam = [
  param('bookId').isMongoId().withMessage('Invalid book id'),
];

const borrowIdParam = [
  param('id').isMongoId().withMessage('Invalid borrow id'),
];

const listBorrowsValidation = [
  query('search').optional().isString().withMessage('Search must be a string'),
  query('status')
    .optional()
    .isIn(['Borrowed', 'Returned', 'Overdue'])
    .withMessage('status must be Borrowed, Returned, or Overdue'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1..100'),
  query('sortBy')
    .optional()
    .isIn(['borrowDate', 'dueDate', 'returnDate', 'createdAt'])
    .withMessage('sortBy must be one of borrowDate, dueDate, returnDate, createdAt'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];

module.exports = {
  bookIdParam,
  borrowIdParam,
  listBorrowsValidation,
};
