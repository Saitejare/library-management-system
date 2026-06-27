const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.borrowDate || value > this.borrowDate;
        },
        message: 'dueDate must be later than borrowDate',
      },
    },
    returnDate: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          return !value || !this.borrowDate || value >= this.borrowDate;
        },
        message: 'returnDate cannot be before borrowDate',
      },
    },
    status: {
      type: String,
      enum: ['Borrowed', 'Returned', 'Overdue'],
      required: true,
      default: 'Borrowed',
    },
    fineAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Fine amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

borrowSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Borrow', borrowSchema);
