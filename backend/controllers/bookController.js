const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  const { search } = req.query;
  const query = search ? {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { ISBN: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ]
  } : {};
  try {
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addBook = async (req, res) => {
  const { title, author, ISBN, category, totalCopies } = req.body;
  try {
    const book = await Book.create({
      title, author, ISBN, category, totalCopies, availableCopies: totalCopies
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
