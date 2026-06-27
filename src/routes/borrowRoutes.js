const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { bookIdParam, borrowIdParam, listBorrowsValidation } = require('../validators/borrowValidator');
const {
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  getMyBorrowHistory,
  listBorrows,
  getBorrowById,
} = require('../controllers/borrowController');

const router = express.Router();

// Member endpoints
router.post('/books/:bookId/borrow', authMiddleware, roleMiddleware('member'), bookIdParam, validateRequest, borrowBook);
router.post('/books/:bookId/return', authMiddleware, roleMiddleware('member'), bookIdParam, validateRequest, returnBook);
router.get('/members/me/books', authMiddleware, roleMiddleware('member'), getMyBorrowedBooks);
router.get('/members/me/history', authMiddleware, roleMiddleware('member'), getMyBorrowHistory);

// Librarian endpoints
router.get('/borrows', authMiddleware, roleMiddleware('librarian'), listBorrowsValidation, validateRequest, listBorrows);
router.get('/borrows/:id', authMiddleware, roleMiddleware('librarian'), borrowIdParam, validateRequest, getBorrowById);

module.exports = router;

