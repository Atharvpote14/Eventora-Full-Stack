const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { validateCategory } = require("../validators/categoryValidators");

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(validateCategory),
  createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(validateCategory),
  updateCategory
);

router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;