const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireRole } = require('../middleware/roleMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', bookController.list);
router.get('/search', bookController.search);
router.get('/:id', bookController.getOne);
router.post('/', requireAuth, requireRole('librarian'), bookController.create);
router.put('/:id', requireAuth, requireRole('librarian'), bookController.updateBook);
router.delete('/:id', requireAuth, requireRole('librarian'), bookController.deleteBook);

module.exports = router;
