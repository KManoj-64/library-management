const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  email: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function all() { 
  return User.find().select('-password'); 
}

async function findById(id) { 
  return User.findOne({ id }); 
}

async function findByUsername(username) { 
  return User.findOne({ username }); 
}

async function create({ username, password, role = 'student', email }) {
  const { v4: uuidv4 } = require('uuid');
  const exists = await findByUsername(username);
  if (exists) throw new Error('UsernameExists');
  const id = uuidv4();
  const user = new User({ id, username, password, role, email });
  await user.save();
  return { id, username, role, email };
}

// Export both helper functions and the underlying Mongoose model as `Model`
module.exports = { all, findById, findByUsername, create, Model: User };
