const express = require("express");

const {
  getDashboard,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  getAdminEvents,
  approveEvent,
  rejectEvent,
  deleteAdminEvent,
  getBookings,
  getPayments,
  getAnalytics,
} = require("../controllers/adminController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", validate(validateRoleChange), updateUserRole);
router.patch("/users/:id/status", validate(validateStatusChange), updateUserStatus);
router.get("/events", getAdminEvents);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);
router.delete("/events/:id", deleteAdminEvent);
router.get("/bookings", getBookings);
router.get("/payments", getPayments);
router.get("/analytics", getAnalytics);

function validateRoleChange(body) {
  const errors = {};
  if (!body.role || !["user", "organizer", "admin"].includes(body.role)) {
    errors.role = "Role must be user, organizer or admin.";
  }
  return errors;
}

function validateStatusChange(body) {
  const errors = {};
  if (typeof body.isActive !== "boolean") {
    errors.isActive = "isActive must be a boolean.";
  }
  return errors;
}

module.exports = router;