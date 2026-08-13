const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("../services/userService");

const getProfile = asyncHandler(async (req, res) => {
  return successResponse(res, {
    data: { user: sanitizeUser(req.user) },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, city, profileImage } = req.body;

  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (phone !== undefined) update.phone = phone.trim();
  if (city !== undefined) update.city = city.trim();
  if (profileImage !== undefined) update.profileImage = profileImage.trim();

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, {
    message: "Profile updated successfully",
    data: { user: sanitizeUser(user) },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  if (await user.matchPassword(newPassword)) {
    throw new ApiError(
      400,
      "New password must be different from the current password."
    );
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, { message: "Password changed successfully" });
});

module.exports = { getProfile, updateProfile, changePassword };