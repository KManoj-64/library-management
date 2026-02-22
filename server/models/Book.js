const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  author: String,
  isbn: String,
  category: String,
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

async function findById(id) { 
  return Book.findOne({ id }); 
}

async function create({ title, author, isbn, category, description, publisher, year, copies = 1 }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const book = new Book({ id, title, author, isbn, category, description, publisher, year, copies, availableCopies: copies });
  await book.save();
  return book.toObject();
}

async function update(id, data) {
  const book = await findById(id);
  if (!book) return null;
  Object.assign(book, data);
  await book.save();
  return book.toObject();
}

async function delete_(id) {
  const book = await Book.deleteOne({ id });
  return book.deletedCount > 0;
}

module.exports = { all, findById, create, update, delete: delete_, Model: Book };
