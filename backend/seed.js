const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminExists = await User.findOne({ email: 'admin@library.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@library.com',
        password: 'adminpassword123',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin seeded');
    } else {
      
      console.log('Admin already exists');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
