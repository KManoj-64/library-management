require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Set Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:3000 ws://localhost:3000"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve client static files
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);

// fallback to client index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'pages', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

// start cron
require('./utils/cronJob')();

// Connect to MongoDB and start server
const { connect } = require('./config/db');
const seedDatabase = require('./utils/seed');

connect().then(async () => {
  // Seed database with test users if empty
  await seedDatabase();
  
  app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`));
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
