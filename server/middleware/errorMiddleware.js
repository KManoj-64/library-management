function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Uploaded file is too large (max 2MB)' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('API Error:', {
      method: req.method,
      path: req.originalUrl,
      message,
      statusCode
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
