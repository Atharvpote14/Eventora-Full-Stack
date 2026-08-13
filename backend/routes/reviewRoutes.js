const express = require("express");

const {
  updateEventReview,
  deleteEventReview,
} = require("../controllers/reviewController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.put("/:id", updateEventReview);
router.delete("/:id", deleteEventReview);

module.exports = router;
