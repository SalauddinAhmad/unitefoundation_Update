const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// super_admin implicitly satisfies every requireRole() check.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'super_admin') return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// Explicit super-admin gate (does NOT get bypassed).
function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Super admin only' });
  next();
}

module.exports = { requireAuth, requireRole, requireSuperAdmin };
