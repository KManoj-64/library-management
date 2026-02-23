const Issue = require('../models/Issue');
const { sendEmail } = require('./sendEmail');

module.exports = function startCron() {
  // every minute check for overdue (demo)
  setInterval(async () => {
    try {
      const now = Date.now();
      const issues = await Issue.all();
      const overdue = issues.filter(i => i.status === 'Issued' && i.returnDate && i.returnDate < now);
      
      if (overdue.length > 0) {
        console.log(`⚠️ Found ${overdue.length} overdue issues`);
      }
      
      overdue.forEach(issue => {
        const daysLate = Math.ceil((now - issue.returnDate) / (24 * 3600 * 1000));
        console.log(`⚠️ Overdue: ${issue.bookTitle} from ${issue.username} (${daysLate} days)`);
        
        sendEmail({
          to: issue.email || 'user@example.com',
          subject: `⚠️ Overdue Book Reminder: ${issue.bookTitle}`,
          text: `Hello ${issue.username},\n\nYour book "${issue.bookTitle}" is ${daysLate} days overdue.\n\nPlease return it as soon as possible to avoid additional fines (₹10 per day).\n\nThank you,\nLibrary Management System`
        });
      });
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  }, 60 * 1000);
};
