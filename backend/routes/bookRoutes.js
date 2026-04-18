const express = require('express');
const router = express.Router();
const { getBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getBooks);
router.post('/', protect, admin, addBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);

module.exports = router;
