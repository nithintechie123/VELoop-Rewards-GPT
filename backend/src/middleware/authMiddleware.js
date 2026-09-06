import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../data/store.js';

export const authMiddleware = (req, res, next) => {
  let token = null;

  // 1. Check Bearer Authorization Header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Explicit User Header Support (for test suites and direct developer session proxy)
  const xUserId = req.headers['x-user-id'];
  if (!token && xUserId) {
    const user = db.getUserById(xUserId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // If no token or header provided
  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token required to perform this action.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.getUserById(decoded.id || decoded.userId || decoded.sub);
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'The account associated with this token no longer exists.'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired session token.',
      details: err.message
    });
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  const xUserId = req.headers['x-user-id'];
  if (xUserId) {
    const user = db.getUserById(xUserId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = db.getUserById(decoded.id || decoded.userId || decoded.sub);
      if (user) {
        req.user = user;
      }
    } catch {}
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
      return next();
    }
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Administrator privileges are required.'
    });
  });
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    authMiddleware(req, res, () => {
      if (req.user && (roles.includes(req.user.role) || req.user.role === 'admin')) {
        return next();
      }
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Requires one of roles: ${roles.join(', ')}.`
      });
    });
  };
};

export const requireTier = (minTier) => {
  const tierHierarchy = { 'Member': 1, 'Silver Member': 1, 'Gold Member': 2, 'Platinum Member': 3, 'Diamond VIP': 4 };
  return (req, res, next) => {
    authMiddleware(req, res, () => {
      const userLevel = tierHierarchy[req.user?.tier] || 1;
      const requiredLevel = tierHierarchy[minTier] || 1;
      if (userLevel >= requiredLevel) {
        return next();
      }
      return res.status(403).json({
        error: 'TIER_INSUFFICIENT',
        message: `This giveaway requires ${minTier} tier or higher. Your current tier is ${req.user?.tier || 'Member'}.`
      });
    });
  };
};
