const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../services/authService");
const { createOtp, verifyOtp } = require("../services/otpService");
const { sendOtpEmail } = require("../services/emailService");
const { sanitizeUser } = require("../services/userService");

const PURPOSE = {
  REGISTRATION: "registration",
  FORGOT_PASSWORD: "forgot-password",
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone = "", city = "" } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser && existingUser.isVerified) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  let user;
  if (existingUser) {
    existingUser.name = name.trim();
    existingUser.password = password;
    existingUser.phone = phone.trim();
    existingUser.city = city.trim();
    await existingUser.save();
    user = existingUser;
  } else {
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      city: city.trim(),
    });
  }

  try {
    const otp = await createOtp(user.email, PURPOSE.REGISTRATION);
    await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: PURPOSE.REGISTRATION,
    });
  } catch (error) {
    console.warn("[email] OTP email failed:", error.message);
  }

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

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(400, "Invalid verification code.");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified.");
  }

  const result = await verifyOtp(user.email, otp, PURPOSE.REGISTRATION);
  if (!result.ok) {
    throw new ApiError(result.status, result.message);
  }

  user.isVerified = true;
  await user.save();

  const { notify } = require("../services/notificationService");
  notify({
    userId: user._id,
    title: "Welcome to Eventora",
    message: "Your email has been verified. Start discovering events and booking tickets!",
    type: "account",
  }).catch(() => {});

  return successResponse(res, { message: "Email verified successfully" });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(400, "No account found with this email.");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified.");
  }

  const otp = await createOtp(user.email, PURPOSE.REGISTRATION);
  try {
    await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: PURPOSE.REGISTRATION,
    });
  } catch (error) {
    console.warn("[email] Resend OTP email failed:", error.message);
  }

  return successResponse(res, {
    message: "Verification code sent. Please check your email.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user && user.isVerified) {
    try {
      const otp = await createOtp(user.email, PURPOSE.FORGOT_PASSWORD);
      await sendOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        purpose: PURPOSE.FORGOT_PASSWORD,
      });
    } catch (error) {
      console.warn("[email] Password reset email failed:", error.message);
    }
  }

  return successResponse(res, {
    message:
      "If an account exists with this email, a password reset code has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(400, "Invalid reset attempt.");
  }

  const result = await verifyOtp(user.email, otp, PURPOSE.FORGOT_PASSWORD);
  if (!result.ok) {
    throw new ApiError(result.status, result.message);
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, {
    message: "Password reset successful. Please login.",
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmailOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
};