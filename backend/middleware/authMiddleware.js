const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const COOKIE_NAME = process.env.COOKIE_NAME || "eventora_token";

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired session. Please login again.");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "User account no longer exists.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been suspended.");
  }

  req.user = user;
  next();
});

const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) req.user = user;
  } catch (error) {
    // Invalid token — treat as anonymous
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate, COOKIE_NAME };