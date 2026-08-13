const express = require("express");

const {
  getEvents,
  getUpcomingEvents,
  getFeaturedEvents,
  getPopularEvents,
  getEventById,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
} = require("../controllers/eventController");
const {
  authenticate,
  optionalAuthenticate,
} = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  validateCreateEvent,
  validateUpdateEvent,
} = require("../validators/eventValidators");
const {
  getEventReviewsController,
  createEventReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/popular", getPopularEvents);
router.get("/slug/:slug", optionalAuthenticate, getEventBySlug);
router.get("/:id", optionalAuthenticate, getEventById);

router.get("/:eventId/reviews", getEventReviewsController);
router.post("/:eventId/reviews", authenticate, createEventReview);

router.post(
  "/",
  authenticate,
  authorize("organizer", "admin"),
  validate(validateCreateEvent),
  createEvent
);

router.put(
  "/:id",
  authenticate,
  authorize("organizer", "admin"),
  validate(validateUpdateEvent),
  updateEvent
);

router.delete("/:id", authenticate, authorize("organizer", "admin"), deleteEvent);

router.patch(
  "/:id/publish",
  authenticate,
  authorize("organizer", "admin"),
  publishEvent
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("organizer", "admin"),
  cancelEvent
);

module.exports = router;