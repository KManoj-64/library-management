const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const { sendReminderEmail } = require('./emailService');

const start = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job...');

    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(now.getDate() + 2);

    // 1. Find books where dueDate is in 2 days and send reminders
    const startOfTwoDays = new Date(twoDaysFromNow.setHours(0, 0, 0, 0));
    const endOfTwoDays = new Date(twoDaysFromNow.setHours(23, 59, 59, 999));

    const reminders = await Transaction.find({
      status: 'issued',
      dueDate: { $gte: startOfTwoDays, $lte: endOfTwoDays },
    }).populate('userId').populate('bookId');

    for (const res of reminders) {
      if (res.userId && res.userId.email && res.bookId) {
        await sendReminderEmail(res.userId.email, res.bookId.title);
      }
    }

    // 2. Find overdue books and update status
    const overdueLoans = await Transaction.find({
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: now },
    });

    for (const loan of overdueLoans) {
      loan.status = 'overdue';
      // Calculate fine (Rs 10 per day)
      const diffTime = Math.abs(now - loan.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      loan.fine = diffDays * 10;
      await loan.save();
    }

    console.log(`Cron job completed. Sent ${reminders.length} reminders. Updated ${overdueLoans.length} overdue status.`);
  });
};

module.exports = { start };
