export const validate = (validatorFn) => {
  return (req, res, next) => {
    const result = validatorFn(req.body);
    if (!result.isValid) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: result.errors[0] || 'Invalid request body',
        errors: result.errors
      });
    }
    next();
  };
};
