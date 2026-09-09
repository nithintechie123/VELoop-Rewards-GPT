/**
 * Request Validation & Input Sanitization Middleware (Requirement 45)
 */

export const validate = (validatorFn) => {
  return (req, res, next) => {
    const result = validatorFn(req.body);
    if (!result.isValid) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        code: 'VALIDATION_FAILED',
        message: result.errors?.[0] || 'Invalid request body',
        errors: result.errors || []
      });
    }
    next();
  };
};

/**
 * Validate presence of required request body fields
 */
export const validateRequired = (...fields) => {
  return (req, res, next) => {
    const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        code: 'VALIDATION_FAILED',
        message: `Missing required field(s): ${missing.join(', ')}`,
        missingFields: missing
      });
    }
    next();
  };
};

/**
 * Deep Input Sanitization: Strips dangerous prototype pollution keys and trims strings
 */
export const sanitizeInputs = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);

    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      // Prototype pollution defense
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }
      // String trimming and XSS script tag stripping
      if (typeof val === 'string') {
        clean[key] = val.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof val === 'object') {
        clean[key] = sanitizeObject(val);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};
