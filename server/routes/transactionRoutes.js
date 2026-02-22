const express = require('express');
const router = express.Router();
const txController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Both students and admins
router.get('/', requireAuth, txController.list);
router.get('/my/loans', requireAuth, txController.getMyLoans);
router.get('/my/history', requireAuth, txController.getMyHistory);

// Admin only
router.get('/issued', requireAuth, requireRole('librarian'), txController.getIssuedBooks);
router.get('/returned', requireAuth, requireRole('librarian'), txController.getReturnedBooks);

// Borrow - Admin can create for anyone, Student creates for themselves
router.post('/borrow', requireAuth, txController.borrow);

// Return - Student can return their own, Admin can return any
router.post('/return', requireAuth, txController.returnBook);

module.exports = router;
