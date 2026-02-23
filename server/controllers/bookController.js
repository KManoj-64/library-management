const Book = require('../models/Book');
const AppError = require('../utils/AppError');

async function list(req, res, next) {
  try {
    const {
      q = '',
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 1000
    } = req.query;

    const result = await Book.queryBooks({ q, sortBy, sortOrder, page, limit });
    res.json({
      success: true,
      books: result.books,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (err) {
    next(err);
  }
}

// Search books by title, author, or category
async function search(req, res, next) {
  try {
    req.query.sortBy = req.query.sortBy || 'title';
    req.query.sortOrder = req.query.sortOrder || 'asc';
    req.query.page = req.query.page || 1;
    req.query.limit = req.query.limit || 1000;
    return list(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, author, isbn, category, coverImage, description, publisher, year, copies } = req.body;
    const book = await Book.create({ title, author, isbn, category, coverImage, description, publisher, year, copies });
    res.json({ success: true, book });
  } catch (err) {
    if (err.message === 'DuplicateBook') return next(new AppError('Book already exists with same ISBN or title+author', 409));
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));
    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, coverImage, description, publisher, year, copies } = req.body;
    const book = await Book.findById(id);
    if (!book) return next(new AppError('Book not found', 404));
    
    const updated = await Book.update(id, { title, author, isbn, category, coverImage, description, publisher, year, copies, availableCopies: copies });
    res.json({ success: true, book: updated });
  } catch (err) {
    if (err.message === 'DuplicateBook') return next(new AppError('Book already exists with same ISBN or title+author', 409));
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Book.delete(id);
    if (!deleted) return next(new AppError('Book not found', 404));
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
}

async function uploadCover(req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError('No cover image uploaded', 400));
    }

    const urlPath = `/uploads/books/${req.file.filename}`;
    res.json({ success: true, coverImage: urlPath });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getOne, updateBook, deleteBook, search, uploadCover };
