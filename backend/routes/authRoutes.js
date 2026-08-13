const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  validateRegister,
  validateLogin,
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

router.post("/register", authLimiter, validate(validateRegister), register);
router.post("/login", authLimiter, validate(validateLogin), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

module.exports = router;