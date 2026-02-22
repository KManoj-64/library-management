const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: String,
  bookId: String,
  username: String,
  bookTitle: String,
  borrowedAt: { type: Number, default: () => Date.now() },
  dueAt: Number,
  returnedAt: { type: Number, default: null },
  fine: { type: Number, default: 0 }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

async function all() { 
  return Transaction.find(); 
}

async function findById(id) { 
  return Transaction.findOne({ id }); 
}

async function create({ userId, bookId, borrowedAt = Date.now(), dueDays = 14, returnedAt = null }) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const dueAt = borrowedAt + dueDays * 24 * 3600 * 1000;
  const tx = new Transaction({ id, userId, bookId, borrowedAt, dueAt, returnedAt });
  await tx.save();
  return { id, userId, bookId, borrowedAt, dueAt, returnedAt };
}

async function update(id, data) {
  const tx = await findById(id);
  if (!tx) return null;
  Object.assign(tx, data);
  await tx.save();
  return tx.toObject();
}

async function delete_(id) {
  const tx = await Transaction.deleteOne({ id });
  return tx.deletedCount > 0;
}

module.exports = { all, findById, create, update, delete: delete_, Model: Transaction };
