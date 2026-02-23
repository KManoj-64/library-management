const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireRole } = require('../middleware/roleMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const { sanitizeRequest } = require('../middleware/sanitizeMiddleware');
const { validateBook } = require('../middleware/validationMiddleware');
const { uploadCover } = require('../middleware/uploadMiddleware');

router.get('/', sanitizeRequest, bookController.list);
router.get('/search', sanitizeRequest, bookController.search);
router.get('/:id', sanitizeRequest, bookController.getOne);
router.post('/upload-cover', requireAuth, requireRole('librarian'), uploadCover.single('cover'), bookController.uploadCover);
router.post('/', requireAuth, requireRole('librarian'), sanitizeRequest, validateBook, bookController.create);
router.put('/:id', requireAuth, requireRole('librarian'), sanitizeRequest, validateBook, bookController.updateBook);
router.delete('/:id', requireAuth, requireRole('librarian'), sanitizeRequest, bookController.deleteBook);

module.exports = router;
