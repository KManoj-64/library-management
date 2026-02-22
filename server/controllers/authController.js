const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function register(req, res) {
  try {
    const { username, password, role, email } = req.body;
    console.log('Register attempt:', { username, role, email });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role, email });
    console.log('Register created user:', user);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } catch (err) {
    if (err.message === 'UsernameExists') return res.status(400).json({ success: false, message: 'Username already exists' });
    console.error('Register error:', err.stack || err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    
    const user = await User.findByUsername(username);
    if (!user) {
      console.log(`✗ User not found: ${username}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`✗ Invalid password for user: ${username}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log(`✓ Login successful for: ${username} (${user.role})`);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { register, login };
