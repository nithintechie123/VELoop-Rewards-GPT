import { AuditLogger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal error occurred.';

  AuditLogger.error(`[${status}] ${errorCode}: ${message}`, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  res.status(status).json({
    error: errorCode,
    message,
    ...(err.details && typeof err.details === 'object' ? err.details : (err.details ? { details: err.details } : {}))
  });
};
