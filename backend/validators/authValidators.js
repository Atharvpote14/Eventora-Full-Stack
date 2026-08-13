const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validateRegister = (body) => {
  const errors = {};
  const name = body.name?.trim();
  const email = body.email?.trim();
  const password = body.password;

  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 80) errors.name = "Name must be under 80 characters";

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Please provide a valid email";

  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (password.length > 72) errors.password = "Password must be under 72 characters";

  return errors;
};

const validateLogin = (body) => {
  const errors = {};
  const email = body.email?.trim();

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Please provide a valid email";

  if (!body.password) errors.password = "Password is required";

  return errors;
};

const validateOtp = (body) => {
  const errors = {};
  const email = body.email?.trim();
  const otp = body.otp?.trim();

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Please provide a valid email";

  if (!otp) errors.otp = "Verification code is required";
  else if (!/^\d{6}$/.test(otp)) errors.otp = "Verification code must be 6 digits";

  return errors;
};

const validateEmailOnly = (body) => {
  const errors = {};
  const email = body.email?.trim();

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Please provide a valid email";

  return errors;
};

const validateResetPassword = (body) => {
  const errors = {};
  const email = body.email?.trim();
  const otp = body.otp?.trim();
  const newPassword = body.newPassword;

  if (!email) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Please provide a valid email";

  if (!otp) errors.otp = "Verification code is required";
  else if (!/^\d{6}$/.test(otp)) errors.otp = "Verification code must be 6 digits";

  if (!newPassword) errors.newPassword = "New password is required";
  else if (newPassword.length < 8)
    errors.newPassword = "Password must be at least 8 characters";
  else if (newPassword.length > 72)
    errors.newPassword = "Password must be under 72 characters";

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOtp,
  validateEmailOnly,
  validateResetPassword,
};