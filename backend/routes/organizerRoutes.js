const express = require("express");

const {
  getEventBookings,
  getEventAttendees,
  getOrganizerDashboard,
  getOrganizerAnalytics,
  getOrganizerEvents,
  getOrganizerAllBookings,
} = require("../controllers/organizerController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate, authorize("organizer", "admin"));

router.get("/dashboard", getOrganizerDashboard);
router.get("/analytics", getOrganizerAnalytics);
router.get("/bookings", getOrganizerAllBookings);
router.get("/events", getOrganizerEvents);
router.get("/events/:eventId/bookings", getEventBookings);
router.get("/events/:eventId/attendees", getEventAttendees);

module.exports = router;