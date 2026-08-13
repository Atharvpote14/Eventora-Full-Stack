const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body);
  if (errors && Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};

module.exports = validate;