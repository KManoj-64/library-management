const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load user module which may export helpers and/or the mongoose model
const userModule = require('../models/User');
let UserModel = userModule && userModule.Model ? userModule.Model : userModule;
const mongoose = require('mongoose');
if (!UserModel || typeof UserModel.countDocuments !== 'function') {
  try {
    // Try to get the registered mongoose model directly
    UserModel = mongoose.model('User');
  } catch (err) {
    // leave as-is; will fail later with clearer logging
  }
}
console.log('Seed using UserModel:', typeof UserModel, UserModel && (UserModel.modelName || UserModel.name));

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    
    // Check if users already exist
    const userCount = await UserModel.countDocuments();
    console.log(`Found ${userCount} existing users`);
    
    if (userCount > 0) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }

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

    console.log('✓ Database seeded successfully! Created 3 test users.');
  } catch (err) {
    console.error('✗ Error seeding database:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

module.exports = seedDatabase;
