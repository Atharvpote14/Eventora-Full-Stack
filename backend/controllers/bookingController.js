const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  BOOKING_EXPIRY_MINUTES,
  MAX_QUANTITY,
  generateBookingReference,
  calculatePricing,
  findTicketType,
  ticketAvailability,
  reserveTickets,
  releaseTickets,
  expirePendingBookings,
  serializeBooking,
} = require("../services/bookingService");
const { initiateRefund } = require("../services/paymentService");

const REFUND_CUTOFF_HOURS = 48;

const createBooking = asyncHandler(async (req, res) => {
  await expirePendingBookings();

  const { eventId, ticketTypeId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(ticketTypeId)) {
    throw new ApiError(400, "Invalid ticket type ID.");
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    throw new ApiError(400, `Quantity must be between 1 and ${MAX_QUANTITY}.`);
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  if (event.status !== "published") {
    throw new ApiError(400, "This event is not available for booking.");
  }
  if (new Date(event.date) < new Date()) {
    throw new ApiError(400, "This event has already taken place.");
  }
  if (
    event.registrationDeadline &&
    new Date(event.registrationDeadline) < new Date()
  ) {
    throw new ApiError(400, "Registration for this event has closed.");
  }

  const ticket = findTicketType(event, ticketTypeId);
  if (!ticket) throw new ApiError(404, "Ticket type not found.");

  const available = ticketAvailability(ticket);
  if (qty > available) {
    throw new ApiError(
      400,
      `Only ${available} ticket(s) available for this ticket type.`
    );
  }

  const reserved = await reserveTickets(
    event._id,
    ticketTypeId,
    qty,
    ticket.sold
  );
  if (!reserved) {
    throw new ApiError(
      409,
      "Tickets were just sold out. Please try a smaller quantity."
    );
  }

  const { subtotal, fees, total } = calculatePricing(ticket.price, qty);

  const booking = await Booking.create({
    bookingReference: generateBookingReference(),
    user: req.user._id,
    event: event._id,
    ticketTypeId,
    ticketType: ticket.name,
    quantity: qty,
    unitPrice: ticket.price,
    subtotal,
    fees,
    amount: total,
    paymentStatus: "pending",
    bookingStatus: "pending",
    expiresAt: new Date(Date.now() + BOOKING_EXPIRY_MINUTES * 60 * 1000),
  });

  const populated = await Booking.findById(booking._id)
    .populate("event", "title slug coverImage date city venue startTime")
    .populate("user", "name email");

  return successResponse(res, {
    status: 201,
    message: "Booking created. Complete payment within 15 minutes.",
    data: { booking: serializeBooking(populated) },
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  await expirePendingBookings();

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [bookings, total] = await Promise.all([
    Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("event", "title slug coverImage date city venue startTime"),
    Booking.countDocuments({ user: req.user._id }),
  ]);

  return successResponse(res, {
    data: bookings.map(serializeBooking),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("event", "title slug coverImage date city venue address startTime organizer")
    .populate("user", "name email");

  if (!booking) throw new ApiError(404, "Booking not found.");

  const isOwner = booking.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isEventOrganizer =
    booking.event.organizer &&
    booking.event.organizer.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isEventOrganizer) {
    throw new ApiError(403, "You do not have permission to view this booking.");
  }

  return successResponse(res, {
    data: { booking: serializeBooking(booking) },
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("event", "organizer title date time");

  if (!booking) throw new ApiError(404, "Booking not found.");

  const isOwner = booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isEventOrganizer =
    booking.event.organizer &&
    booking.event.organizer.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isEventOrganizer) {
    throw new ApiError(403, "You do not have permission to cancel this booking.");
  }

  if (booking.bookingStatus === "completed" || booking.bookingStatus === "expired") {
    throw new ApiError(400, `A ${booking.bookingStatus} booking cannot be cancelled.`);
  }
  if (booking.bookingStatus === "cancelled" || booking.bookingStatus === "refunded") {
    throw new ApiError(400, `This booking is already ${booking.bookingStatus}.`);
  }

  const wasPaid = booking.paymentStatus === "paid";
  const wasRefunded = booking.paymentStatus === "refunded";

  let message;
  let refund;

  if (wasPaid) {
    const eventDate = booking.event.date ? new Date(booking.event.date) : null;
    const hoursToEvent = eventDate ? (eventDate.getTime() - Date.now()) / 3600000 : Infinity;

    if (hoursToEvent < REFUND_CUTOFF_HOURS) {
      await releaseTickets(booking.event._id, booking.ticketTypeId, booking.quantity);
      await require("../models/Ticket").updateMany(
        { booking: booking._id },
        { $set: { status: "cancelled" } }
      );
      booking.bookingStatus = "cancelled";
      await booking.save();
      message =
        "Booking cancelled. Cancellation within the last 48 hours before the event is not eligible for a refund.";
    } else {
      const payment = await require("../models/Payment").findOne({
        booking: booking._id,
        status: "successful",
      });
      if (payment) {
        refund = await initiateRefund({
          paymentId: payment._id,
          requestedById: req.user._id,
          isAdmin,
        });
        booking.bookingStatus = "refunded";
        booking.paymentStatus = "refunded";
        await booking.save();
        message = "Booking cancelled and full refund initiated.";
      } else {
        await releaseTickets(booking.event._id, booking.ticketTypeId, booking.quantity);
        await require("../models/Ticket").updateMany(
          { booking: booking._id },
          { $set: { status: "cancelled" } }
        );
        booking.bookingStatus = "cancelled";
        await booking.save();
        message = "Booking cancelled successfully.";
      }
    }
  } else if (wasRefunded) {
    message = "Booking was already refunded.";
  } else {
    await releaseTickets(booking.event._id, booking.ticketTypeId, booking.quantity);
    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();
    message = "Booking cancelled successfully.";
  }

  return successResponse(res, {
    message,
    data: {
      booking: serializeBooking(booking),
      refund: refund || null,
    },
  });
});

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking };