const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const { successResponse, errorResponse } = require('../utils/response');

const { buildBookQuery, getSort } = require('../utils/bookQueryBuilder');

const listBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    const filter = buildBookQuery(req.query);
    const sort = getSort(sortBy, order);

    const totalBooks = await Book.countDocuments(filter);
    if (totalBooks === 0) {
      return errorResponse(res, 'No matching books found', 404);
    }

    const totalPages = Math.ceil(totalBooks / pageSize);

    const books = await Book.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return successResponse(res, {
      books,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: pageNum,
        pageSize,
      },
    }, 'Books fetched successfully');
  } catch (error) {
    console.error('List books error:', error);
    return errorResponse(res, 'Failed to fetch books', 500);
  }
};

const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }
    return successResponse(res, book, 'Book fetched');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch book');
  }
};

const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  try {
    const book = await Book.create(req.body);
    return successResponse(res, book, 'Book created', 201);
  } catch (error) {
    console.error('Book creation error:', error);
    const message = error?.message || 'Failed to create book';
    return errorResponse(res, message, 400);
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }
    return successResponse(res, book, 'Book updated');
  } catch (error) {
    return errorResponse(res, 'Failed to update book');
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }
    return successResponse(res, null, 'Book deleted');
  } catch (error) {
    return errorResponse(res, 'Failed to delete book');
  }
};

module.exports = {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};
