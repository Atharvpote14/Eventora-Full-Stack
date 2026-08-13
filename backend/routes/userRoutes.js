const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  validateUpdateProfile,
  validateChangePassword,
} = require("../validators/userValidators");

const router = express.Router();

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

router.get("/me", authenticate, getProfile);
router.put(
  "/me",
  authenticate,
  validate(validateUpdateProfile),
  updateProfile
);
router.put(
  "/me/password",
  authenticate,
  passwordLimiter,
  validate(validateChangePassword),
  changePassword
);

module.exports = router;