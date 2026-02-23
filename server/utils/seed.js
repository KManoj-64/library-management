const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load user module which may export helpers and/or the mongoose model
const userModule = require('../models/User');
const bookModule = require('../models/Book');
let UserModel = userModule && userModule.Model ? userModule.Model : userModule;
let BookModel = bookModule && bookModule.Model ? bookModule.Model : bookModule;
const mongoose = require('mongoose');
if (!UserModel || typeof UserModel.countDocuments !== 'function') {
  try {
    // Try to get the registered mongoose model directly
    UserModel = mongoose.model('User');
  } catch (err) {
    // leave as-is; will fail later with clearer logging
  }
}
if (!BookModel || typeof BookModel.countDocuments !== 'function') {
  try {
    BookModel = mongoose.model('Book');
  } catch (err) {
    // leave as-is; will fail later with clearer logging
  }
}
console.log('Seed using UserModel:', typeof UserModel, UserModel && (UserModel.modelName || UserModel.name));
console.log('Seed using BookModel:', typeof BookModel, BookModel && (BookModel.modelName || BookModel.name));

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    
    // Check if users already exist
    const userCount = await UserModel.countDocuments();
    console.log(`Found ${userCount} existing users`);

    // Create test users
    const testUsers = [
      {
        username: 'student1',
        password: 'password123',
        email: 'student1@example.com',
        role: 'student'
      },
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'librarian'
      },
      {
        username: 'student2',
        password: 'password456',
        email: 'student2@example.com',
        role: 'student'
      }
    ];

    if (userCount === 0) {
      for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new UserModel({
          id: uuidv4(),
          username: userData.username,
          password: hashedPassword,
          email: userData.email,
          role: userData.role
        });
        await user.save();
        console.log(`Created user: ${userData.username} (${userData.role})`);
      }
    } else {
      console.log('✓ Users already present, skipping user seed');
    }

    const bookCount = await BookModel.countDocuments();
    console.log(`Found ${bookCount} existing books`);

    const sampleBooks = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Fiction', publisher: 'Scribner', year: 1925, copies: 4, description: 'A classic novel set in the Jazz Age.' },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Fiction', publisher: 'J.B. Lippincott & Co.', year: 1960, copies: 5, description: 'A novel about justice and racial inequality.' },
      { title: '1984', author: 'George Orwell', isbn: '9780451524935', category: 'Dystopian', publisher: 'Secker & Warburg', year: 1949, copies: 6, description: 'A dystopian social science fiction novel.' },
      { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', category: 'Classic', publisher: 'T. Egerton', year: 1813, copies: 3, description: 'A romantic novel of manners.' },
      { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', category: 'Fiction', publisher: 'HarperOne', year: 1988, copies: 5, description: 'A philosophical novel about following dreams.' },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', category: 'Fantasy', publisher: 'George Allen & Unwin', year: 1937, copies: 5, description: 'A fantasy adventure preceding The Lord of the Rings.' },
      { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', category: 'Self-Help', publisher: 'Avery', year: 2018, copies: 7, description: 'A practical guide to building better habits.' },
      { title: 'Deep Work', author: 'Cal Newport', isbn: '9781455586691', category: 'Productivity', publisher: 'Grand Central Publishing', year: 2016, copies: 4, description: 'Rules for focused success in a distracted world.' },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Programming', publisher: 'Prentice Hall', year: 2008, copies: 5, description: 'A handbook of agile software craftsmanship.' },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', category: 'Programming', publisher: 'Addison-Wesley', year: 2019, copies: 4, description: 'Journey to mastery for software developers.' },
      { title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '9780857197689', category: 'Finance', publisher: 'Harriman House', year: 2020, copies: 6, description: 'Timeless lessons on wealth, greed, and happiness.' },
      { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', category: 'History', publisher: 'Harper', year: 2011, copies: 4, description: 'A brief history of humankind.' },
      { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', category: 'Memoir', publisher: 'Random House', year: 2018, copies: 3, description: 'A memoir about education and self-invention.' },
      { title: 'Ikigai', author: 'Héctor García', isbn: '9780143130722', category: 'Lifestyle', publisher: 'Penguin Life', year: 2016, copies: 5, description: 'The Japanese secret to a long and happy life.' },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', category: 'Psychology', publisher: 'Farrar, Straus and Giroux', year: 2011, copies: 4, description: 'Insights into how we think and make decisions.' }
    ];

    if (bookCount < sampleBooks.length) {
      const existingBooks = await BookModel.find({}, { title: 1, _id: 0 }).lean();
      const existingTitles = new Set(existingBooks.map(book => book.title));

      const missingBooks = sampleBooks.filter(book => !existingTitles.has(book.title));
      const booksToInsert = missingBooks.map(book => ({
        id: uuidv4(),
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        year: book.year,
        copies: book.copies,
        availableCopies: book.copies,
        description: book.description
      }));

      if (booksToInsert.length > 0) {
        await BookModel.insertMany(booksToInsert);
      }

      console.log(`✓ Added ${booksToInsert.length} sample books (target: ${sampleBooks.length})`);
    } else {
      console.log('✓ Books already present, skipping book seed');
    }

    console.log('✓ Database seed finished successfully.');
  } catch (err) {
    console.error('✗ Error seeding database:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

module.exports = seedDatabase;
