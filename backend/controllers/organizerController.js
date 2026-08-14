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
      bookings: bookings.map((b) => ({
        ...serializeBooking(b),
        user: b.user ? { name: b.user.name, email: b.user.email } : null,
      })),
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

const getOrganizerEvents = asyncHandler(async (req, res) => {
  const { serializeListEvent } = require("../services/eventService");

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = { organizer: req.user._id };
  const validStatuses = ["draft", "pending", "published", "rejected", "cancelled", "completed"];
  if (req.query.status && validStatuses.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [events, total] = await Promise.all([
    require("../models/Event")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name slug image"),
    require("../models/Event").countDocuments(filter),
  ]);

  return successResponse(res, {
    data: events.map(serializeListEvent),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getOrganizerAllBookings = asyncHandler(async (req, res) => {
  const Event = require("../models/Event");
  const eventIds = (await Event.find({ organizer: req.user._id }, "_id")).map(
    (e) => e._id
  );

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = { event: { $in: eventIds } };
  const valid = ["pending", "confirmed", "cancelled", "completed", "expired", "refunded", "failed"];
  if (req.query.status && valid.includes(req.query.status)) {
    filter.bookingStatus = req.query.status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("event", "title date slug")
      .populate("user", "name email"),
    Booking.countDocuments(filter),
  ]);

  return successResponse(res, {
    data: bookings.map((b) => ({
      ...serializeBooking(b),
      user: b.user ? { name: b.user.name, email: b.user.email } : null,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getOrganizerDashboard = asyncHandler(async (req, res) => {
  const Event = require("../models/Event");
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map((e) => e._id);

  const bookings = await Booking.find({ event: { $in: eventIds } })
    .populate("event", "title date slug")
    .populate("user", "name email");

  const publishedEvents = events.filter((e) => e.status === "published");
  const now = new Date();

  const totalEvents = events.length;
  const publishedCount = publishedEvents.length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const upcomingEvents = publishedEvents.filter((e) => e.date >= now).length;

  const availableCapacity = publishedEvents.reduce((sum, e) => {
    const capacity = e.ticketTypes.reduce((s, t) => s + (t.capacity || 0), 0);
    const sold = e.ticketTypes.reduce((s, t) => s + (t.sold || 0), 0);
    return sum + Math.max(0, capacity - sold);
  }, 0);

  const totalBookings = bookings.length;
  const ticketsSold = bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .reduce((s, b) => s + b.quantity, 0);
  const grossRevenue = bookings
    .filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "refunded")
    .reduce((s, b) => s + b.amount, 0);
  const refundedRevenue = bookings
    .filter((b) => b.paymentStatus === "refunded")
    .reduce((s, b) => s + b.amount, 0);
  const totalRevenue = grossRevenue - refundedRevenue;

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const recentEvents = [...events]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const eventPerformance = events
    .map((e) => {
      const eb = bookings.filter((b) => b.event._id.toString() === e._id.toString());
      const sold = eb
        .filter((b) => b.bookingStatus === "confirmed")
        .reduce((s, b) => s + b.quantity, 0);
      const revenue =
        eb
          .filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "refunded")
          .reduce((s, b) => s + b.amount, 0) -
        eb
          .filter((b) => b.paymentStatus === "refunded")
          .reduce((s, b) => s + b.amount, 0);
      const capacity = e.ticketTypes.reduce((s, t) => s + (t.capacity || 0), 0);
      return {
        _id: e._id,
        title: e.title,
        slug: e.slug,
        date: e.date,
        status: e.status,
        ticketsSold: sold,
        capacity,
        revenue,
        bookingsCount: eb.length,
        fillRate: capacity ? Math.min(100, Math.round((sold / capacity) * 100)) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return successResponse(res, {
    data: {
      totalEvents,
      publishedEvents: publishedCount,
      pendingEvents,
      totalBookings,
      ticketsSold,
      totalRevenue,
      availableCapacity,
      upcomingEvents,
      recentBookings: recentBookings.map(serializeBooking),
      recentEvents: recentEvents.map((e) => ({
        _id: e._id,
        title: e.title,
        slug: e.slug,
        date: e.date,
        city: e.city,
        status: e.status,
      })),
      eventPerformance,
    },
  });
});

const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const Event = require("../models/Event");

  const period = ["7d", "30d", "90d", "12m"].includes(req.query.period)
    ? req.query.period
    : "30d";
  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;

  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1))
  );

  const eventIds = (await Event.find({ organizer: req.user._id }, "_id")).map((e) => e._id);

  const bookings = await Booking.find({
    event: { $in: eventIds },
    createdAt: { $gte: start },
  }).populate("event", "title");

  const labels = [];
  for (let i = 0; i < days; i += 1) {
    labels.push(new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10));
  }

  const byDay = (fn) =>
    labels.map((label) =>
      bookings
        .filter((b) => b.createdAt.toISOString().slice(0, 10) === label)
        .reduce(fn, 0)
    );

  const revenueValues = byDay(
    (sum, b) => sum + (b.paymentStatus === "paid" ? b.amount : 0)
  );
  const bookingValues = byDay((sum) => sum + 1);
  const ticketsSoldValues = byDay(
    (sum, b) => sum + (b.bookingStatus === "confirmed" ? b.quantity : 0)
  );

  const perEvent = new Map();
  for (const b of bookings) {
    const key = b.event._id.toString();
    if (!perEvent.has(key)) {
      perEvent.set(key, { _id: b.event._id, title: b.event.title, revenue: 0, bookings: 0 });
    }
    const entry = perEvent.get(key);
    entry.bookings += 1;
    entry.revenue += b.paymentStatus === "paid" ? b.amount : 0;
  }
  const topEvents = [...perEvent.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return successResponse(res, {
    data: {
      revenue: { labels, values: revenueValues },
      bookings: { labels, values: bookingValues },
      ticketsSold: { labels, values: ticketsSoldValues },
      topEvents,
    },
  });
});

module.exports = {
  getEventBookings,
  getEventAttendees,
  getOrganizerDashboard,
  getOrganizerAnalytics,
  getOrganizerEvents,
  getOrganizerAllBookings,
};