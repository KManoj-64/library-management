function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ');
}

function sanitizeObject(data) {
  if (Array.isArray(data)) return data.map(sanitizeObject);
  if (!data || typeof data !== 'object') return sanitizeString(data);

  const sanitized = {};
  Object.keys(data).forEach((key) => {
    sanitized[key] = sanitizeObject(data[key]);
  });
  return sanitized;
}

function sanitizeRequest(req, res, next) {
  req.body = sanitizeObject(req.body || {});
  req.query = sanitizeObject(req.query || {});
  req.params = sanitizeObject(req.params || {});
  next();
}

module.exports = { sanitizeRequest, sanitizeString };
