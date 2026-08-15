const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  verifyEmailOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { authenticate, optionalAuthenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  validateRegister,
  validateLogin,
  validateOtp,
  validateEmailOnly,
  validateResetPassword,
} = require("../validators/authValidators");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

router.post("/register", authLimiter, validate(validateRegister), register);
router.post("/verify-otp", otpLimiter, validate(validateOtp), verifyEmailOtp);
router.post("/resend-otp", resendLimiter, validate(validateEmailOnly), resendOtp);
router.post("/login", authLimiter, validate(validateLogin), login);
router.post("/google", authLimiter, googleAuth);
router.post("/logout", authenticate, logout);
router.get("/me", optionalAuthenticate, getMe);
router.post(
  "/forgot-password",
  passwordLimiter,
  validate(validateEmailOnly),
  forgotPassword
);
router.post(
  "/reset-password",
  passwordLimiter,
  validate(validateResetPassword),
  resetPassword
);

module.exports = router;