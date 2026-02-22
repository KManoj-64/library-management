function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}

module.exports = { requireRole };
