const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Authenticate candidate user token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
};

// Optional auth token (for anonymous vs logged in tracking)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
};

// Authenticate staff admin token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded.isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }
    req.admin = decoded;
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateAdmin,
};
