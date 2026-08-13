const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { serializeBooking } = require("../services/bookingService");

const getEventBookings = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }

  const { event, bookings, total } = await loadEventBookings(req);

  return successResponse(res, {
    data: {
      event: {
        _id: event._id,
        title: event.title,
        slug: event.slug,
        date: event.date,
        city: event.city,
        venue: event.venue,
        ticketTypes: event.ticketTypes,
      },
      bookings: bookings.map(serializeBooking),
    },
    pagination: {
      page: req.pagination.page,
      limit: req.pagination.limit,
      total,
      pages: Math.ceil(total / Math.max(1, req.pagination.limit)),
    },
  });
});

const getEventAttendees = asyncHandler(async (req, res) => {
  const { event, bookings } = await loadEventBookings(req, { all: true });

  const attendees = bookings
    .filter(
      (b) =>
        b.bookingStatus === "confirmed" || b.bookingStatus === "pending"
    )
    .map((b) => ({
      name: b.user.name,
      email: b.user.email,
      ticketType: b.ticketType,
      quantity: b.quantity,
      bookingStatus: b.bookingStatus,
      bookingReference: b.bookingReference,
      bookingId: b._id,
    }));

  return successResponse(res, {
    data: {
      event: {
        _id: event._id,
        title: event.title,
        slug: event.slug,
      },
      totalAttendees: attendees.length,
      ticketsSold: bookings.reduce((sum, b) => sum + b.quantity, 0),
      attendees,
    },
  });
});

const loadEventBookings = async (req, { all = false } = {}) => {
  const { eventId } = req.params;

  const event = await requireOwnedEvent(eventId, req.user);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  req.pagination = { page, limit };

  const filter = { event: event._id };
  if (!all && req.query.status) {
    const valid = ["pending", "confirmed", "cancelled", "completed", "expired", "refunded", "failed"];
    if (valid.includes(req.query.status)) filter.bookingStatus = req.query.status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email"),
    Booking.countDocuments(filter),
  ]);

  return { event, bookings, total };
};

const requireOwnedEvent = async (eventId, user) => {
  const Event = require("../models/Event");
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  const isOrganizer = event.organizer.toString() === user._id.toString();
  const isAdmin = user.role === "admin";
  if (!isOrganizer && !isAdmin) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }

  return event;
};

module.exports = { getEventBookings, getEventAttendees };