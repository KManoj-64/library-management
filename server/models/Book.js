const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const bookSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  author: String,
  isbn: String,
  category: String,
  coverImage: String,
  description: String,
  publisher: String,
  year: Number,
  copies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

async function all() { 
  return Book.find(); 
}

async function queryBooks({ q = '', sortBy = 'title', sortOrder = 'asc', page = 1, limit = 10 }) {
  const query = {};

  if (q && q.trim()) {
    const safeQuery = q.trim();
    query.$or = [
      { title: { $regex: safeQuery, $options: 'i' } },
      { author: { $regex: safeQuery, $options: 'i' } }
    ];
  }

  const normalizedSortBy = sortBy === 'availability' ? 'availableCopies' : 'title';
  const normalizedSortOrder = sortOrder === 'desc' ? -1 : 1;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 1000);
  const skip = (pageNumber - 1) * limitNumber;

  const [books, total] = await Promise.all([
    Book.find(query)
      .sort({ [normalizedSortBy]: normalizedSortOrder, title: 1 })
      .skip(skip)
      .limit(limitNumber),
    Book.countDocuments(query)
  ]);

  return {
    books,
    total,
    page: pageNumber,
    limit: limitNumber,
    pages: Math.ceil(total / limitNumber)
  };
}

async function findById(id) { 
  return Book.findOne({ id }); 
}

async function findDuplicate({ title, author, isbn, excludeId }) {
  const conditions = [];

  if (isbn) {
    conditions.push({ isbn });
  }

  if (title && author) {
    conditions.push({ title, author });
  }

  if (conditions.length === 0) {
    return null;
  }

  const query = { $or: conditions };
  if (excludeId) {
    query.id = { $ne: excludeId };
  }

  return Book.findOne(query);
}

async function create({ title, author, isbn, category, coverImage, description, publisher, year, copies = 1 }) {
  const { v4: uuidv4 } = require('uuid');
  const duplicate = await findDuplicate({ title, author, isbn });
  if (duplicate) {
    throw new AppError('DuplicateBook', 409);
  }

  const id = uuidv4();
  const book = new Book({ id, title, author, isbn, category, coverImage, description, publisher, year, copies, availableCopies: copies });
  await book.save();
  return book.toObject();
}

async function update(id, data) {
  const book = await findById(id);
  if (!book) return null;

  const duplicate = await findDuplicate({
    title: data.title,
    author: data.author,
    isbn: data.isbn,
    excludeId: id
  });

  if (duplicate) {
    throw new AppError('DuplicateBook', 409);
  }

  Object.assign(book, data);
  await book.save();
  return book.toObject();
}

async function delete_(id) {
  const book = await Book.deleteOne({ id });
  return book.deletedCount > 0;
}

module.exports = { all, queryBooks, findById, create, update, delete: delete_, Model: Book };
