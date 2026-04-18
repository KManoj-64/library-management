const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cronService = require('./services/cronService');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Start Cron Jobs
cronService.start();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
