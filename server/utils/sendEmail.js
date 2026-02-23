const nodemailer = require('nodemailer');

let transporter = null;
let hasWarnedMissingConfig = false;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (!hasWarnedMissingConfig) {
      console.warn('⚠️ SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM in server/.env');
      hasWarnedMissingConfig = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

async function sendEmail({ to, subject, text }) {
  if (!to) {
    console.warn('⚠️ Email skipped: recipient address is missing');
    return { sent: false, reason: 'missing-recipient' };
  }

  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    console.log('📧 Email not sent (SMTP not configured):', { to, subject });
    return { sent: false, reason: 'smtp-not-configured' };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const info = await activeTransporter.sendMail({
    from,
    to,
    subject,
    text
  });

  console.log(`📧 Email sent to ${to} (messageId: ${info.messageId})`);
  return { sent: true, messageId: info.messageId };
}

module.exports = { sendEmail };
