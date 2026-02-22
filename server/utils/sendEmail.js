// Stub email sender - replace with real provider in production
function sendEmail({ to, subject, text }) {
  console.log('sendEmail:', { to, subject, text });
}

module.exports = { sendEmail };
