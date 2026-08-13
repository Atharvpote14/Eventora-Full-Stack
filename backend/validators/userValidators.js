const validateUpdateProfile = (body) => {
  const errors = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) errors.name = "Name cannot be empty";
    else if (name.length < 2) errors.name = "Name must be at least 2 characters";
    else if (name.length > 80) errors.name = "Name must be under 80 characters";
  }

  if (body.phone !== undefined) {
    const phone = body.phone.trim();
    if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone))
      errors.phone = "Please provide a valid phone number";
  }

  if (body.city !== undefined && body.city.trim().length > 80) {
    errors.city = "City must be under 80 characters";
  }

  if (
    body.profileImage !== undefined &&
    body.profileImage.trim() &&
    !/^https?:\/\/.+/.test(body.profileImage.trim())
  ) {
    errors.profileImage = "Profile image must be a valid URL";
  }

  return errors;
};

const validateChangePassword = (body) => {
  const errors = {};

  if (!body.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!body.newPassword) {
    errors.newPassword = "New password is required";
  } else if (body.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  } else if (body.newPassword.length > 72) {
    errors.newPassword = "Password must be under 72 characters";
  }

  return errors;
};

module.exports = { validateUpdateProfile, validateChangePassword };