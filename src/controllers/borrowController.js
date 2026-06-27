const mongoose = require('mongoose');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const FINE_PER_DAY = 10; // currency units per day

async function withTransaction(fn) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

// POST /api/books/:bookId/borrow
const borrowBook = async (req, res) => {
  const { bookId } = req.params;
  const memberId = req.user._id;

  try {
    // Basic checks
    const member = await User.findById(memberId).select('+isActive role');
    if (!member || !member.isActive) {
      return errorResponse(res, 'Member account is not active', 403);
    }

    // Transactional operation
    const result = await withTransaction(async (session) => {
      const book = await Book.findById(bookId).session(session);
      if (!book) {
        return { status: 404, body: { success: false, message: 'Book not found' } };
      }

      if (book.status !== 'Available' || book.availableQuantity <= 0) {
        return { status: 409, body: { success: false, message: 'Book is unavailable' } };
      }

      // Ensure user has not already borrowed this book (not returned)
      const existing = await Borrow.findOne({ member: memberId, book: bookId, status: { $in: ['Borrowed', 'Overdue'] } }).session(session);
      if (existing) {
        return { status: 409, body: { success: false, message: 'Book already borrowed by user' } };
      }

      const now = new Date();
      const dueDate = new Date(now.getTime() + 14 * MS_PER_DAY);

      const borrow = await Borrow.create([
        {
          member: memberId,
          book: bookId,
          borrowDate: now,
          dueDate,
          status: 'Borrowed',
          fineAmount: 0,
        },
      ], { session });

      // decrement availableQuantity
      book.availableQuantity -= 1;
      if (book.availableQuantity <= 0) {
        book.availableQuantity = 0;
        book.status = 'Unavailable';
      }
      await book.save({ session });

      return { status: 201, body: { success: true, message: 'Book borrowed successfully', data: borrow[0] } };
    });

    if (!result) {
      return errorResponse(res, 'Failed to borrow book', 500);
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Borrow book error:', error);
    return errorResponse(res, 'Failed to borrow book', 500);
  }
};

// POST /api/books/:bookId/return
const returnBook = async (req, res) => {
  const { bookId } = req.params;
  const memberId = req.user._id;

  try {
    const result = await withTransaction(async (session) => {
      const book = await Book.findById(bookId).session(session);
      if (!book) {
        return { status: 404, body: { success: false, message: 'Book not found' } };
      }

      // find borrow record for this member and book that is Borrowed or Overdue
      const borrow = await Borrow.findOne({ member: memberId, book: bookId, status: { $in: ['Borrowed', 'Overdue'] } }).session(session);
      if (!borrow) {
        return { status: 404, body: { success: false, message: 'Active borrow record not found' } };
      }

      const now = new Date();
      borrow.returnDate = now;

      // fine calculation
      let fine = 0;
      if (borrow.dueDate && now > borrow.dueDate) {
        const daysOverdue = Math.ceil((now - borrow.dueDate) / MS_PER_DAY);
        fine = daysOverdue * FINE_PER_DAY;
      }
      borrow.fineAmount = fine;
      borrow.status = 'Returned';
      await borrow.save({ session });

      // increment availableQuantity
      book.availableQuantity += 1;
      if (book.quantity > 0 && book.availableQuantity > 0) {
        book.status = 'Available';
      }
      await book.save({ session });

      return { status: 200, body: { success: true, message: 'Book returned successfully', data: { borrow, fineAmount: fine } } };
    });

    if (!result) {
      return errorResponse(res, 'Failed to return book', 500);
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Return book error:', error);
    return errorResponse(res, 'Failed to return book', 500);
  }
};

// GET /api/members/me/books (active borrowed books)
const getMyBorrowedBooks = async (req, res) => {
  try {
    const memberId = req.user._id;
    const borrows = await Borrow.find({ member: memberId, status: { $in: ['Borrowed', 'Overdue'] } })
      .populate({ path: 'book', select: 'title author isbn' })
      .select('book borrowDate dueDate status fineAmount')
      .sort({ borrowDate: -1 })
      .lean();

    const now = new Date();
    const results = borrows.map((b) => {
      const due = b.dueDate ? new Date(b.dueDate) : null;
      const daysRemaining = due ? Math.ceil((due - now) / MS_PER_DAY) : null;
      return {
        book: b.book,
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        daysRemaining: daysRemaining,
        status: b.status,
        fine: b.fineAmount || 0,
      };
    });

    return successResponse(res, { books: results }, 'Current borrowed books fetched successfully');
  } catch (error) {
    console.error('Get my borrowed books error:', error);
    return errorResponse(res, 'Failed to fetch borrowed books', 500);
  }
};

// GET /api/members/me/history
const getMyBorrowHistory = async (req, res) => {
  try {
    const memberId = req.user._id;
    const borrows = await Borrow.find({ member: memberId })
      .populate({ path: 'book', select: 'title author isbn' })
      .select('book borrowDate dueDate returnDate status fineAmount createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, { history: borrows }, 'Borrow history fetched successfully');
  } catch (error) {
    console.error('Get borrow history error:', error);
    return errorResponse(res, 'Failed to fetch borrow history', 500);
  }
};

// GET /api/borrows (librarian) - search & filter & paginate
const listBorrows = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search,
      status,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = Math.min(parseInt(limit, 10) || 10, 100);

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const s = search.trim();
      // search by member name/email or book title/isbn
      filter.$or = [
        { 'member.name': { $regex: s, $options: 'i' } },
        { 'member.email': { $regex: s, $options: 'i' } },
        { 'book.title': { $regex: s, $options: 'i' } },
        { 'book.isbn': { $regex: s, $options: 'i' } },
      ];
    }

    // Build aggregation to allow search on populated fields efficiently
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const aggregate = Borrow.aggregate()
      .lookup({ from: 'users', localField: 'member', foreignField: '_id', as: 'member' })
      .unwind({ path: '$member', preserveNullAndEmptyArrays: true })
      .lookup({ from: 'books', localField: 'book', foreignField: '_id', as: 'book' })
      .unwind({ path: '$book', preserveNullAndEmptyArrays: true })
      .match(filter)
      .sort(sort)
      .project({
        'member.password': 0,
        'book.__v': 0,
      });

    const total = await Borrow.aggregate()
      .lookup({ from: 'users', localField: 'member', foreignField: '_id', as: 'member' })
      .unwind({ path: '$member', preserveNullAndEmptyArrays: true })
      .lookup({ from: 'books', localField: 'book', foreignField: '_id', as: 'book' })
      .unwind({ path: '$book', preserveNullAndEmptyArrays: true })
      .match(filter)
      .count('count');

    const totalCount = (total[0] && total[0].count) || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const docs = await Borrow.aggregate()
      .lookup({ from: 'users', localField: 'member', foreignField: '_id', as: 'member' })
      .unwind({ path: '$member', preserveNullAndEmptyArrays: true })
      .lookup({ from: 'books', localField: 'book', foreignField: '_id', as: 'book' })
      .unwind({ path: '$book', preserveNullAndEmptyArrays: true })
      .match(filter)
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .project({
        'member.password': 0,
        'book.__v': 0,
      });

    return successResponse(res, {
      borrows: docs,
      pagination: {
        totalBorrows: totalCount,
        totalPages,
        currentPage: pageNum,
        pageSize,
      },
    }, 'Borrows fetched successfully');
  } catch (error) {
    console.error('List borrows error:', error);
    return errorResponse(res, 'Failed to fetch borrows', 500);
  }
};

// GET /api/borrows/:id (librarian)
const getBorrowById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid borrow id', 400);
    }

    const borrow = await Borrow.findById(id)
      .populate({ path: 'member', select: 'name email' })
      .populate({ path: 'book', select: 'title author isbn' })
      .lean();

    if (!borrow) {
      return errorResponse(res, 'Borrow record not found', 404);
    }

    return successResponse(res, borrow, 'Borrow fetched successfully');
  } catch (error) {
    console.error('Get borrow by id error:', error);
    return errorResponse(res, 'Failed to fetch borrow', 500);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  getMyBorrowHistory,
  listBorrows,
  getBorrowById,
};
