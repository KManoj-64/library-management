const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const AppError = require('../utils/AppError');

const FINE_PER_DAY = 10; // Fine in rupees per day
const MAX_ACTIVE_BOOKS_PER_USER = Number(process.env.MAX_ACTIVE_BOOKS_PER_USER || 3);
const DEFAULT_DUE_DAYS = 14;

function addDueMetadata(issue) {
  const now = Date.now();
  const dueInMs = (issue.returnDate || now) - now;
  const dueDaysRemaining = Math.ceil(dueInMs / (24 * 3600 * 1000));
  const overdue = issue.status === 'Issued' && dueDaysRemaining < 0;
  const overdueDays = overdue ? Math.abs(dueDaysRemaining) : 0;
  const estimatedFine = overdue ? overdueDays * FINE_PER_DAY : 0;

  return {
    ...issue,
    dueDaysRemaining,
    overdue,
    overdueDays,
    estimatedFine
  };
}

function normalizeIssueRecord(issue, booksById, usersById) {
  const raw = issue && typeof issue.toObject === 'function' ? issue.toObject() : issue;
  const issueDateValue = Number(raw.issueDate);
  const validIssueDate = Number.isFinite(issueDateValue)
    ? issueDateValue
    : (raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now());

  const returnDateValue = Number(raw.returnDate);
  const validReturnDate = Number.isFinite(returnDateValue)
    ? returnDateValue
    : validIssueDate + DEFAULT_DUE_DAYS * 24 * 3600 * 1000;

  const book = booksById.get(raw.bookId);
  const user = usersById.get(raw.userId);

  const normalizedStatus = raw.status === 'Issued' || raw.status === 'Returned'
    ? raw.status
    : (raw.actualReturnDate ? 'Returned' : 'Unknown');

  const normalized = {
    ...raw,
    issueDate: validIssueDate,
    returnDate: validReturnDate,
    status: normalizedStatus,
    username: raw.username || user?.username || 'Unknown',
    bookTitle: raw.bookTitle || book?.title || 'N/A',
    bookAuthor: raw.bookAuthor || book?.author || 'Unknown'
  };

  return addDueMetadata(normalized);
}

function isValidIssuedRecord(issue) {
  const issueDate = Number(issue.issueDate);
  const returnDate = Number(issue.returnDate);
  return Boolean(
    issue &&
    issue.status === 'Issued' &&
    issue.userId &&
    issue.bookId &&
    Number.isFinite(issueDate) &&
    Number.isFinite(returnDate)
  );
}

async function enrichIssues(issues) {
  if (!issues || issues.length === 0) return [];

  const bookIds = [...new Set(issues.map(issue => issue.bookId).filter(Boolean))];
  const userIds = [...new Set(issues.map(issue => issue.userId).filter(Boolean))];

  const [books, users] = await Promise.all([
    bookIds.length ? Book.Model.find({ id: { $in: bookIds } }).lean() : [],
    userIds.length ? User.Model.find({ id: { $in: userIds } }).select('id username').lean() : []
  ]);

  const booksById = new Map(books.map(book => [book.id, book]));
  const usersById = new Map(users.map(user => [user.id, user]));

  return issues.map(issue => normalizeIssueRecord(issue, booksById, usersById));
}

async function list(req, res, next) {
  try {
    const issues = req.user.role === 'librarian'
      ? await Issue.all()
      : await Issue.findByUserId(req.user.id);
    const enriched = await enrichIssues(issues);
    res.json({ success: true, transactions: enriched });
  } catch (err) {
    next(err);
  }
}

// Get student's own active loans
async function getMyLoans(req, res, next) {
  try {
    const userId = req.user.id;
    const issues = await Issue.findByUserId(userId);
    const enriched = await enrichIssues(issues);
    const activeLoans = enriched.filter(isValidIssuedRecord);
    res.json({ success: true, loans: activeLoans });
  } catch (err) {
    next(err);
  }
}

// Get student's loan history
async function getMyHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const issues = await Issue.findByUserId(userId);
    const enriched = await enrichIssues(issues);
    res.json({ success: true, transactions: enriched });
  } catch (err) {
    next(err);
  }
}

async function getIssuedBooks(req, res, next) {
  try {
    const issued = await Issue.getIssuedBooks();
    const enriched = (await enrichIssues(issued)).filter(isValidIssuedRecord);
    res.json({ success: true, issued: enriched, transactions: enriched });
  } catch (err) {
    next(err);
  }
}

async function getReturnedBooks(req, res, next) {
  try {
    const returned = await Issue.getReturnedBooks();
    res.json({ success: true, returned, transactions: returned });
  } catch (err) {
    next(err);
  }
}

async function getDashboardAnalytics(req, res, next) {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [totalBooks, booksIssuedToday, overdueBooks] = await Promise.all([
      Book.Model.countDocuments(),
      Issue.Model.countDocuments({ issueDate: { $gte: todayStart.getTime(), $lte: todayEnd.getTime() } }),
      Issue.Model.countDocuments({ status: 'Issued', returnDate: { $lt: now.getTime() } })
    ]);

    const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
    const activeUserIds = await Issue.Model.distinct('userId', { issueDate: { $gte: thirtyDaysAgo } });
    const activeUsers = activeUserIds.length;

    const monthlyBorrowing = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);

      const count = await Issue.Model.countDocuments({
        issueDate: { $gte: monthStart.getTime(), $lt: monthEnd.getTime() }
      });

      monthlyBorrowing.push({
        label: monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        count
      });
    }

    res.json({
      success: true,
      stats: {
        totalBooks,
        booksIssuedToday,
        overdueBooks,
        activeUsers
      },
      monthlyBorrowing
    });
  } catch (err) {
    next(err);
  }
}

async function borrow(req, res, next) {
  try {
    const { bookId, userId, dueDays = 14 } = req.body;
    const actualUserId = req.user.role === 'librarian' ? (userId || req.user.id) : req.user.id;
    
    const book = await Book.findById(bookId);
    if (!book) return next(new AppError('Book not found', 404));
    if ((book.availableCopies || 0) <= 0) return next(new AppError('No copies available', 400));
    
    const user = await User.findById(actualUserId);
    if (!user) return next(new AppError('User not found', 404));

    const [activeCount, existingBorrow] = await Promise.all([
      Issue.countActiveByUser(actualUserId),
      Issue.findActiveByUserAndBook(actualUserId, bookId)
    ]);

    if (activeCount >= MAX_ACTIVE_BOOKS_PER_USER) {
      return next(new AppError(`Borrow limit reached. Max ${MAX_ACTIVE_BOOKS_PER_USER} active books per user.`, 400));
    }

    if (existingBorrow) {
      return next(new AppError('This book is already borrowed by the same user and not yet returned.', 409));
    }

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
      bookTitle: book.title,
      bookAuthor: book.author || 'Unknown'
    });
    
    console.log(`✓ Issue created with ID: ${issue.id}, due date: ${new Date(returnDate).toLocaleDateString()}`);
    
    // Decrement available copies
    await Book.update(bookId, { availableCopies: (book.availableCopies || 1) - 1 });
    
    // Send email notification (non-blocking)
    sendEmail({
      to: user?.email,
      subject: `📚 Book Issued: ${book.title}`,
      text: `Hello ${user?.username},\n\nYour book "${book.title}" by ${book.author} has been issued.\n\nIssue Date: ${new Date(issueDate).toLocaleDateString()}\nDue Date: ${new Date(returnDate).toLocaleDateString()}\n\nPlease return within the due date to avoid fines (₹${FINE_PER_DAY}/day).\n\nThank you,\nLibrary Management System`
    }).catch((emailErr) => {
      console.error(`✗ Failed to send issue email: ${emailErr.message}`);
    });
    
    res.json({ success: true, issue, returnDate });
  } catch (err) {
    console.error(`✗ Error borrowing book: ${err.message}`);
    next(err);
  }
}

async function returnBook(req, res, next) {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId);
    if (!issue) return next(new AppError('Issue record not found', 404));
    if (issue.status === 'Returned') return next(new AppError('Book already returned', 400));
    
    // For students, only allow returning their own books
    if (req.user.role === 'student' && issue.userId !== req.user.id) {
      return next(new AppError('Cannot return book issued to another student', 403));
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
    
    // Send return notification (non-blocking)
    const user = await User.findById(issue.userId);
    sendEmail({
      to: user?.email,
      subject: `📚 Book Returned: ${issue.bookTitle}`,
      text: `Hello ${issue.username},\n\nYour book "${issue.bookTitle}" has been returned successfully.\n\nReturn Date: ${new Date(actualReturnDate).toLocaleDateString()}\n${fine > 0 ? `Fine Charged: ₹${fine}` : 'No fines charged.'}\n\nThank you,\nLibrary Management System`
    }).catch((emailErr) => {
      console.error(`✗ Failed to send return email: ${emailErr.message}`);
    });
    
    res.json({ success: true, issue: updated, fine });
  } catch (err) {
    console.error(`✗ Error returning book: ${err.message}`);
    next(err);
  }
}

module.exports = { list, borrow, returnBook, getIssuedBooks, getReturnedBooks, getMyLoans, getMyHistory, getDashboardAnalytics };
