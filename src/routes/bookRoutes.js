const express = require('express');
const { body } = require('express-validator');
const { listBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { listBooksValidation, createBookValidation, updateBookValidation } = require('../validators/bookValidator');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', authMiddleware, listBooksValidation, validateRequest, listBooks);
router.get('/:id', authMiddleware, getBook);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('librarian'),
  createBookValidation,
  validateRequest,
  createBook
);
router.put('/:id', authMiddleware, roleMiddleware('librarian'), updateBookValidation, validateRequest, updateBook);
router.delete('/:id', authMiddleware, roleMiddleware('librarian'), deleteBook);

module.exports = router;
