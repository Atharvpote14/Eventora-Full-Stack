const express = require("express");

const {
  listActiveSlides,
  listAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} = require("../controllers/heroController");
const {
  authenticate,
} = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/slides", listActiveSlides);

router.get("/slides/all", authenticate, authorize("organizer", "admin"), listAllSlides);
router.post("/slides", authenticate, authorize("organizer", "admin"), createSlide);
router.patch("/slides/:id", authenticate, authorize("organizer", "admin"), updateSlide);
router.delete("/slides/:id", authenticate, authorize("organizer", "admin"), deleteSlide);

module.exports = router;
