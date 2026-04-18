const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendBookIssuedEmail, sendRenewalEmail } = require('../services/emailService');

exports.issueBook = async (req, res) => {
  const { userId, bookId } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transaction = await Transaction.create({
      userId, bookId, dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    await sendBookIssuedEmail(user.email, book.title, transaction.issueDate, dueDate);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId');
    if (!transaction || transaction.status === 'returned') {
      return res.status(400).json({ message: 'Invalid transaction' });
    }

    const returnDate = new Date();
    transaction.status = 'returned';
    transaction.returnDate = returnDate;

    if (returnDate > transaction.dueDate) {
      const diffTime = Math.abs(returnDate - transaction.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      transaction.fine = diffDays * 10;
    }

    // Update book copies
    const book = await Book.findById(transaction.bookId);
    book.availableCopies += 1;
    await book.save();
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('bookId').populate('userId');
    if (!transaction || transaction.status === 'returned') {
      return res.status(400).json({ message: 'Cannot renew this book' });
    }

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 14);
    transaction.dueDate = newDueDate;
    transaction.status = 'issued'; // Reset from overdue if it was
    transaction.fine = 0; // Reset fine on renewal (per requirements usually, but I'll stick to simple extension)
    
    await transaction.save();

    await sendRenewalEmail(transaction.userId.email, transaction.bookId.title, newDueDate);

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title author ISBN')
      .sort('-createdAt');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('bookId')
      .sort('-createdAt');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const booksIssuedToday = await Transaction.countDocuments({ issueDate: { $gte: today } });
    const overdueBooks = await Transaction.countDocuments({ status: 'overdue' });
    const activeUsers = await User.countDocuments({ role: 'student', isVerified: true });

    const monthsToShow = 12;
    const now = new Date();
    const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);
    const endOfWindow = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const borrowedAgg = await Transaction.aggregate([
      {
        $match: {
          issueDate: { $gte: startOfWindow, $lt: endOfWindow }
        }
      },
      {
        $group: {
          _id: { year: { $year: "$issueDate" }, month: { $month: "$issueDate" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const returnedAgg = await Transaction.aggregate([
      { $match: { status: 'returned' } },
      {
        $addFields: {
          effectiveReturnDate: { $ifNull: ["$returnDate", "$updatedAt"] }
        }
      },
      {
        $match: {
          effectiveReturnDate: { $gte: startOfWindow, $lt: endOfWindow }
        }
      },
      {
        $group: {
          _id: { year: { $year: "$effectiveReturnDate" }, month: { $month: "$effectiveReturnDate" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const borrowedMap = new Map(
      borrowedAgg.map((item) => [`${item._id.year}-${item._id.month}`, item.count])
    );
    const returnedMap = new Map(
      returnedAgg.map((item) => [`${item._id.year}-${item._id.month}`, item.count])
    );

    const monthlyActivity = [];
    const cursor = new Date(startOfWindow);
    for (let i = 0; i < monthsToShow; i += 1) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const key = `${year}-${month}`;
      monthlyActivity.push({
        year,
        month,
        label: cursor.toLocaleString('en-US', { month: 'short' }),
        borrowed: borrowedMap.get(key) || 0,
        returned: returnedMap.get(key) || 0
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json({ totalBooks, booksIssuedToday, overdueBooks, activeUsers, monthlyActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
