const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, required: true },
  collegeId: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student'], default: 'student' },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Auto-delete after expiry using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1 });

module.exports = mongoose.model('OTP', otpSchema);
