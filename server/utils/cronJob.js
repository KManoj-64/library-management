const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const { sendEmail } = require('./sendEmail');

module.exports = function startCron() {
  // every minute check for overdue (demo)
  setInterval(async () => {
    try {
      const now = Date.now();
      const txs = await Transaction.all();
      const overdue = txs.filter(t => !t.returnedAt && t.dueAt && t.dueAt < now);
      overdue.forEach(t => {
        console.log('Overdue transaction detected', t.id);
        sendEmail({ to: 'user@example.com', subject: 'Overdue book', text: `Transaction ${t.id} is overdue` });
      });
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  }, 60 * 1000);
};
