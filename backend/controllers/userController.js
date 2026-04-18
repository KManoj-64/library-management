const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    
    // Enrich with borrow stats
    const enrichedStudents = await Promise.all(students.map(async (student) => {
      const transactions = await Transaction.find({ userId: student._id });
      const totalBorrowed = transactions.length;
      const activeLoans = transactions.filter(t => t.status !== 'returned').length;
      return {
        ...student._doc,
        totalBorrowed,
        activeLoans
      };
    }));

    res.json(enrichedStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
