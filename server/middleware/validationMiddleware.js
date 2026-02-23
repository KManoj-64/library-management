const AppError = require('../utils/AppError');

function validateRegister(req, res, next) {
  const { username, password, email } = req.body;

  if (!username || username.length < 3) {
    return next(new AppError('Username must be at least 3 characters', 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new AppError('Valid email is required', 400));
  }

  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new AppError('Username and password are required', 400));
  }
  next();
}

function validateBook(req, res, next) {
  const { title, author, copies, year } = req.body;

  if (!title || !author) {
    return next(new AppError('Title and author are required', 400));
  }

  if (copies !== undefined) {
    const copiesNum = Number(copies);
    if (!Number.isInteger(copiesNum) || copiesNum < 1) {
      return next(new AppError('Copies must be a positive integer', 400));
    }
    req.body.copies = copiesNum;
  }

  if (year !== undefined && year !== null && year !== '') {
    const yearNum = Number(year);
    const currentYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(yearNum) || yearNum < 1000 || yearNum > currentYear) {
      return next(new AppError('Year is invalid', 400));
    }
    req.body.year = yearNum;
  }

  next();
}

function validateBorrow(req, res, next) {
  const { bookId, dueDays } = req.body;
  if (!bookId) {
    return next(new AppError('Book ID is required', 400));
  }

  if (dueDays !== undefined) {
    const days = Number(dueDays);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      return next(new AppError('Due days must be between 1 and 90', 400));
    }
    req.body.dueDays = days;
  }

  next();
}

function validateReturn(req, res, next) {
  const { issueId } = req.body;
  if (!issueId) {
    return next(new AppError('Issue ID is required', 400));
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateBook,
  validateBorrow,
  validateReturn
};
