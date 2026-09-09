import { AuditLogger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal error occurred.';

  // Requirement 43: Intercept MongoServerError E11000 duplicate key errors
  const errText = String(err.message || '') + ' ' + String(err.name || '');
  if (err.code === 11000 || err.name === 'MongoServerError' || errText.includes('E11000') || errText.includes('duplicate key error')) {
    status = 400;
    errorCode = 'ALREADY_PARTICIPATING';
    message = 'You can participate again when a new giveaway event begins.';
  }

  AuditLogger.error(`[${status}] ${errorCode}: ${message}`, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  res.status(status).json({
    error: errorCode,
    code: errorCode,
    message,
    ...(err.details && typeof err.details === 'object' ? err.details : (err.details ? { details: err.details } : {}))
  });
};
