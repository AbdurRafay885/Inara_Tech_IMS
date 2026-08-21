export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    console.error('Validation helper error:', error);
    const issues = error.errors || error.issues || [];
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};
