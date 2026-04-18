const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailToken = require('../models/EmailToken');
const OTP = require('../models/OTP');
const { sendVerificationEmail, sendOTPEmail } = require('../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { name, email, password, collegeId } = req.body;
  try {
    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({ message: 'Name, email, college ID, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCollegeId = String(collegeId).trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    await OTP.deleteMany({ email: normalizedEmail });

    const passwordHash = await bcrypt.hash(password, 10);
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await OTP.create({
      email: normalizedEmail,
      name,
      collegeId: normalizedCollegeId,
      passwordHash,
      role: 'student',
      otp: hashedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    await sendOTPEmail(normalizedEmail, otp);

    res.status(201).json({ message: 'OTP sent. Please verify to complete registration.', email: normalizedEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpData = await OTP.findOne({ email: normalizedEmail });
    if (!otpData) return res.status(400).json({ message: 'OTP expired or not found' });

    if (otpData.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: otpData._id });
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    const isMatch = await bcrypt.compare(otp, otpData.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      await OTP.deleteOne({ _id: otpData._id });
      return res.status(409).json({ message: 'User already exists' });
    }

    await User.create({
      name: otpData.name,
      email: normalizedEmail,
      collegeId: otpData.collegeId,
      password: otpData.passwordHash,
      role: otpData.role || 'student',
      isVerified: true
    });
    await OTP.deleteOne({ _id: otpData._id });

    res.status(200).json({ message: 'Email verified. Registration completed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otpData = await OTP.findOne({ email: normalizedEmail });
    if (!otpData) {
      return res.status(400).json({ message: 'Registration session expired. Please register again.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    otpData.otp = hashedOtp;
    otpData.expiresAt = Date.now() + 5 * 60 * 1000;
    await otpData.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const emailToken = await EmailToken.findOne({ token });
    if (!emailToken || emailToken.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(emailToken.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();
    await emailToken.deleteOne();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
