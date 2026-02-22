const Book = require('../models/Book');

async function list(req, res) {
  try {
    const books = await Book.all();
    res.json({ success: true, books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Search books by title, author, or category
async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      const books = await Book.all();
      return res.json({ success: true, books });
    }
    
    const query = q.toLowerCase().trim();
    const books = await Book.all();
    const results = books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.category && book.category.toLowerCase().includes(query)) ||
      (book.isbn && book.isbn.includes(query))
    );
    
    res.json({ success: true, books: results, count: results.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  try {
    const { title, author, isbn, category, description, publisher, year, copies } = req.body;
    if (!title || !author) return res.status(400).json({ success: false, message: 'Title and author required' });
    const book = await Book.create({ title, author, isbn, category, description, publisher, year, copies });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getOne(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, description, publisher, year, copies } = req.body;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    const updated = await Book.update(id, { title, author, isbn, category, description, publisher, year, copies, availableCopies: copies });
    res.json({ success: true, book: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Book.delete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { list, create, getOne, updateBook, deleteBook, search };
