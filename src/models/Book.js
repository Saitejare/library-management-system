const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    publisher: {
      type: String,
      trim: true,
      default: null,
    },
    publishedYear: {
      type: Number,
      min: 0,
      default: null,
    },
    edition: {
      type: String,
      trim: true,
      default: null,
    },
    language: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    coverImage: {
      type: String,
      trim: true,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
      default: 0,
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ category: 1 });

bookSchema.pre('validate', function () {
  if (this.availableQuantity > this.quantity) {
    throw new Error('availableQuantity cannot exceed quantity');
  }

  if (this.quantity === 0 && this.status === 'Available') {
    this.status = 'Unavailable';
  }
});

module.exports = mongoose.model('Book', bookSchema);
