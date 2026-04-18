const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/students', protect, admin, getStudents);
router.get('/', protect, admin, getStudents);

module.exports = router;
