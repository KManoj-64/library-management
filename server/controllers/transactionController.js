const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

const FINE_PER_DAY = 10; // Fine in rupees per day

async function list(req, res) {
  try {
    const issues = await Issue.all();
    res.json({ success: true, transactions: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get student's own active loans
async function getMyLoans(req, res) {
  try {
    const userId = req.user.id;
    const issues = await Issue.findByUserId(userId);
    const activeLoans = issues.filter(issue => issue.status === 'Issued');
    res.json({ success: true, loans: activeLoans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get student's loan history
async function getMyHistory(req, res) {
  try {
    const userId = req.user.id;
    const issues = await Issue.findByUserId(userId);
    res.json({ success: true, transactions: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getIssuedBooks(req, res) {
  try {
    const issued = await Issue.getIssuedBooks();
    res.json({ success: true, issued, transactions: issued });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getReturnedBooks(req, res) {
  try {
    const returned = await Issue.getReturnedBooks();
    res.json({ success: true, returned, transactions: returned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function borrow(req, res) {
  try {
    const { bookId, userId, dueDays = 14 } = req.body;
    const actualUserId = userId || req.user.id;
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if ((book.availableCopies || 0) <= 0) return res.status(400).json({ success: false, message: 'No copies available' });
    
    const user = await User.findById(actualUserId);
    const issueDate = Date.now();
    const returnDate = issueDate + dueDays * 24 * 3600 * 1000;
    
    console.log(`✓ Creating issue for user: ${user?.username}, book: ${book.title}`);
    
    // Create issue record using the new Issue model
    const issue = await Issue.create({
      userId: actualUserId,
      bookId,
      issueDate,
      dueDays,
      username: user?.username || 'Unknown',
      bookTitle: book.title
    });
    
    console.log(`✓ Issue created with ID: ${issue.id}, due date: ${new Date(returnDate).toLocaleDateString()}`);
    
    // Decrement available copies
    await Book.update(bookId, { availableCopies: (book.availableCopies || 1) - 1 });
    
    // Send email notification
    sendEmail({
      to: user?.email,
      subject: `📚 Book Issued: ${book.title}`,
      text: `Hello ${user?.username},\n\nYour book "${book.title}" by ${book.author} has been issued.\n\nIssue Date: ${new Date(issueDate).toLocaleDateString()}\nDue Date: ${new Date(returnDate).toLocaleDateString()}\n\nPlease return within the due date to avoid fines (₹${FINE_PER_DAY}/day).\n\nThank you,\nLibrary Management System`
    });
    
    res.json({ success: true, issue, returnDate });
  } catch (err) {
    console.error(`✗ Error borrowing book: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function returnBook(req, res) {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found' });
    if (issue.status === 'Returned') return res.status(400).json({ success: false, message: 'Book already returned' });
    
    // For students, only allow returning their own books
    if (req.user.role === 'student' && issue.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Cannot return book issued to another student' });
    }
    
    const actualReturnDate = Date.now();
    let fine = 0;
    
    // Calculate fine if overdue
    if (actualReturnDate > issue.returnDate) {
      const daysLate = Math.ceil((actualReturnDate - issue.returnDate) / (24 * 3600 * 1000));
      fine = daysLate * FINE_PER_DAY;
      console.log(`⚠️ Book is ${daysLate} days late. Fine: ₹${fine}`);
    }
    
    // Update issue record
    const updated = await Issue.returnIssue(issueId, actualReturnDate, fine);
    
    // Increment available copies
    const book = await Book.findById(issue.bookId);
    if (book) await Book.update(book.id, { availableCopies: (book.availableCopies || 0) + 1 });
    
    console.log(`✓ Book returned: ${issue.bookTitle}, fine: ₹${fine}`);
    
    // Send return notification
    const user = await User.findById(issue.userId);
    sendEmail({
      to: user?.email,
      subject: `📚 Book Returned: ${issue.bookTitle}`,
      text: `Hello ${issue.username},\n\nYour book "${issue.bookTitle}" has been returned successfully.\n\nReturn Date: ${new Date(actualReturnDate).toLocaleDateString()}\n${fine > 0 ? `Fine Charged: ₹${fine}` : 'No fines charged.'}\n\nThank you,\nLibrary Management System`
    });
    
    res.json({ success: true, issue: updated, fine });
  } catch (err) {
    console.error(`✗ Error returning book: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { list, borrow, returnBook, getIssuedBooks, getReturnedBooks, getMyLoans, getMyHistory };
