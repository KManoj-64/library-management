const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  collegeId: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  // If password is already a bcrypt hash (OTP verification flow), don't re-hash it.
  if (typeof this.password === 'string' && /^\$2[aby]\$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
