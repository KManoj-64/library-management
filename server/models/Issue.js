const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const issueSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  username: String,
  bookTitle: String,
  issueDate: { type: Number, default: () => Date.now() },
  returnDate: { type: Number, required: true }, // Due date (issueDate + 14 days)
  actualReturnDate: { type: Number, default: null }, // When book was actually returned
  status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' },
  fine: { type: Number, default: 0 } // Late return fine
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);

// Helper functions
async function all() {
  return await Issue.find();
}

async function findById(id) {
  return await Issue.findOne({ id });
}

async function findByUserId(userId) {
  return await Issue.find({ userId });
}

async function create({ userId, bookId, issueDate = Date.now(), dueDays = 14, username = '', bookTitle = '' }) {
  const id = uuidv4();
  const returnDate = issueDate + (dueDays * 24 * 3600 * 1000);
  
  const issue = new Issue({
    id,
    userId,
    bookId,
    username,
    bookTitle,
    issueDate,
    returnDate,
    actualReturnDate: null,
    status: 'Issued',
    fine: 0
  });
  
  await issue.save();
  return issue.toObject();
}

async function update(id, data) {
  const issue = await findById(id);
  if (!issue) return null;
  
  // If returning book, update status and actual return date
  if (data.actualReturnDate) {
    data.status = 'Returned';
  }
  
  Object.assign(issue, data);
  await issue.save();
  return issue.toObject();
}

async function returnIssue(id, actualReturnDate = Date.now(), fine = 0) {
  const issue = await findById(id);
  if (!issue) return null;
  
  issue.actualReturnDate = actualReturnDate;
  issue.status = 'Returned';
  issue.fine = fine;
  await issue.save();
  return issue.toObject();
}

async function getIssuedBooks() {
  return await Issue.find({ status: 'Issued' });
}

async function getReturnedBooks() {
  return await Issue.find({ status: 'Returned' });
}

async function delete_(id) {
  const result = await Issue.deleteOne({ id });
  return result.deletedCount > 0;
}

module.exports = {
  all,
  findById,
  findByUserId,
  create,
  update,
  returnIssue,
  getIssuedBooks,
  getReturnedBooks,
  delete: delete_,
  Model: Issue
};
