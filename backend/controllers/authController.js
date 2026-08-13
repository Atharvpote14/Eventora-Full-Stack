const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../services/authService");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  profileImage: user.profileImage,
  phone: user.phone,
  city: user.city,
  createdAt: user.createdAt,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone = "", city = "" } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone.trim(),
    city: city.trim(),
  });

  return successResponse(
    res,
    {
      status: 201,
      message: "Registration successful. Please verify your email.",
      data: { user: sanitizeUser(user) },
    }
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been suspended.");
  }

  if (!user.isVerified) {
    throw new ApiError(
      403,
      "Please verify your email address before logging in. A verification code was sent to your email."
    );
  }

  const token = generateToken(user._id, user.role);
  setAuthCookie(res, token);

  return successResponse(res, {
    message: "Login successful",
    data: { user: sanitizeUser(user) },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return successResponse(res, { message: "Logout successful" });
});

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, {
    data: { user: sanitizeUser(req.user) },
  });
});

module.exports = { register, login, logout, getMe };