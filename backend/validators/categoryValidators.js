const validateCategory = (body) => {
  const errors = {};

  if (body.name !== undefined) {
    const name = (body.name || "").trim();
    if (!name) errors.name = "Name is required";
    else if (name.length < 2) errors.name = "Name must be at least 2 characters";
    else if (name.length > 80) errors.name = "Name must be under 80 characters";
  }

  if (body.description !== undefined && body.description.trim().length > 500) {
    errors.description = "Description must be under 500 characters";
  }

  if (
    body.image !== undefined &&
    body.image.trim() &&
    !/^https?:\/\/.+/.test(body.image.trim())
  ) {
    errors.image = "Image must be a valid URL";
  }

  return errors;
};

module.exports = { validateCategory };