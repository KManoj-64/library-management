const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  renewBook,
  getTransactions,
  getUserTransactions,
  getDashboardStats
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/my', protect, getUserTransactions);
router.get('/all', protect, admin, getTransactions);
router.get('/', protect, admin, getTransactions); // Support root GET for admin
router.post('/issue', protect, admin, issueBook);
router.put('/return/:id', protect, admin, returnBook);
router.put('/renew/:id', protect, admin, renewBook);

module.exports = router;
