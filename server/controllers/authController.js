const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function register(req, res, next) {
  try {
    const { username, password, email } = req.body;
    const role = 'student';
    console.log('Register attempt:', { username, role, email });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role, email });
    console.log('Register created user:', user);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } catch (err) {
    if (err.message === 'UsernameExists') return next(new AppError('Username already exists', 400));
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    
    const user = await User.findByUsername(username);
    if (!user) {
      console.log(`✗ User not found: ${username}`);
      return next(new AppError('Invalid credentials', 401));
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`✗ Invalid password for user: ${username}`);
      return next(new AppError('Invalid credentials', 401));
    }
    
    console.log(`✓ Login successful for: ${username} (${user.role})`);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err) {
    next(err);
  }
}

// Get all users (admin only)
async function getUsers(req, res, next) {
  try {
    const role = req.query.role;
    let users = await User.all();
    
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

// Get all students (admin only)
async function getStudents(req, res, next) {
  try {
    const users = await User.all();
    const students = users.filter(u => u.role === 'student');
    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getUsers, getStudents };
