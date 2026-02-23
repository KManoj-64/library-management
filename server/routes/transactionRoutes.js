const express = require('express');
const router = express.Router();
const txController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { sanitizeRequest } = require('../middleware/sanitizeMiddleware');
const { validateBorrow, validateReturn } = require('../middleware/validationMiddleware');

// Both students and admins
router.get('/', requireAuth, sanitizeRequest, txController.list);
router.get('/my/loans', requireAuth, sanitizeRequest, txController.getMyLoans);
router.get('/my/history', requireAuth, sanitizeRequest, txController.getMyHistory);

// Admin only
router.get('/analytics', requireAuth, requireRole('librarian'), sanitizeRequest, txController.getDashboardAnalytics);
router.get('/issued', requireAuth, requireRole('librarian'), sanitizeRequest, txController.getIssuedBooks);
router.get('/returned', requireAuth, requireRole('librarian'), sanitizeRequest, txController.getReturnedBooks);

// Borrow - Admin can create for anyone, Student creates for themselves
router.post('/borrow', requireAuth, sanitizeRequest, validateBorrow, txController.borrow);

// Return - Student can return their own, Admin can return any
router.post('/return', requireAuth, sanitizeRequest, validateReturn, txController.returnBook);

module.exports = router;
