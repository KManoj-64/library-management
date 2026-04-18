const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from the backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"LMS Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email Sending Error:', error);
    throw new Error('Failed to send email. Please check your credentials.');
  }
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify/${token}`;
  await sendEmail(
    email,
    'Verify your Email',
    `<h1>Welcome to LMS</h1><p>Click <a href="${url}">here</a> to verify your email.</p>`
  );
};

const sendOTPEmail = async (email, otp) => {
  await sendEmail(
    email,
    'Your Verification OTP',
    `<h1>Email Verification</h1><p>Your OTP for LMS registration is: <strong>${otp}</strong></p><p>This OTP is valid for 5 minutes.</p>`
  );
};

const sendBookIssuedEmail = async (email, bookTitle, issueDate, dueDate) => {
  await sendEmail(
    email,
    'Book Issued',
    `<h1>Book Issued</h1><p>Book: ${bookTitle}</p><p>Issue Date: ${issueDate.toDateString()}</p><p>Due Date: ${dueDate.toDateString()}</p>`
  );
};

const sendReminderEmail = async (email, bookTitle) => {
  await sendEmail(
    email,
    'Return/Renew Reminder',
    `<h1>Reminder</h1><p>Please return or renew your book: ${bookTitle}. It is due in 2 days.</p>`
  );
};

const sendRenewalEmail = async (email, bookTitle, newDueDate) => {
  await sendEmail(
    email,
    'Book Renewed',
    `<h1>Renewal Successful</h1><p>Book: ${bookTitle}</p><p>New Due Date: ${newDueDate.toDateString()}</p>`
  );
};

module.exports = {
  sendVerificationEmail,
  sendOTPEmail,
  sendBookIssuedEmail,
  sendReminderEmail,
  sendRenewalEmail,
};
