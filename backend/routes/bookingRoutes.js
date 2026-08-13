const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

const validateCreateBooking = (body) => {
  const errors = {};
  if (!body.eventId) errors.eventId = "eventId is required";
  if (!body.ticketTypeId) errors.ticketTypeId = "ticketTypeId is required";
  if (body.quantity === undefined) errors.quantity = "quantity is required";
  else if (!Number.isInteger(Number(body.quantity)) || Number(body.quantity) < 1 || Number(body.quantity) > 10)
    errors.quantity = "quantity must be an integer between 1 and 10";
  return errors;
};

router.post(
  "/",
  authenticate,
  validate(validateCreateBooking),
  createBooking
);
router.get("/my", authenticate, getMyBookings);
router.get("/:id", authenticate, getBooking);
router.patch("/:id/cancel", authenticate, cancelBooking);

module.exports = router;