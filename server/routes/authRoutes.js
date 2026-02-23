const express = require('express');
const router = express.Router();
const { register, login, getUsers, getStudents } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { sanitizeRequest } = require('../middleware/sanitizeMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', sanitizeRequest, validateRegister, register);
router.post('/login', sanitizeRequest, validateLogin, login);

// Admin only - get all users or filtered by role
router.get('/users', requireAuth, requireRole('librarian'), sanitizeRequest, getUsers);

// Admin only - get students specifically
router.get('/students', requireAuth, requireRole('librarian'), sanitizeRequest, getStudents);

module.exports = router;
