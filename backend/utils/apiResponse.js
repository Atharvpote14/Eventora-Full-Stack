const successResponse = (
  res,
  { status = 200, message = "Operation successful", data = null } = {}
) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(status).json(body);
};

const errorResponse = (
  res,
  { status = 500, message = "Internal server error", errors = null } = {}
) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

module.exports = { successResponse, errorResponse };
