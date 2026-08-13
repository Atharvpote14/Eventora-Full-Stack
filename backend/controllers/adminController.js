const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("../services/userService");

const ROLE_OPTIONS = ["user", "organizer", "admin"];
const PAGE_LIMIT_MAX = 50;

const paginate = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    PAGE_LIMIT_MAX,
    Math.max(1, parseInt(req.query.limit, 10) || 20)
  );
  return { page, limit, skip: (page - 1) * limit };
};

const buildRegex = (value) =>
  new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const getDashboard = asyncHandler(async (req, res) => {
  const [users, organizers, events, bookings, payments, pendingEvents] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "organizer" }),
      Event.countDocuments(),
      Booking.countDocuments(),
      Payment.countDocuments(),
      Event.countDocuments({ status: "pending" }),
    ]);

  const revenueResult = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  return successResponse(res, {
    data: {
      users,
      organizers,
      events,
      bookings,
      payments,
      revenue,
      pendingEvents,
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const { search, role } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [{ name: buildRegex(search) }, { email: buildRegex(search) }];
  }
  if (role && ROLE_OPTIONS.includes(role)) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email role isVerified isActive createdAt"),
    User.countDocuments(filter),
  ]);

  return successResponse(res, {
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user ID.");
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  return successResponse(res, { data: { user: sanitizeUser(user) } });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!ROLE_OPTIONS.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${ROLE_OPTIONS.join(", ")}.`);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot remove the last admin.");
    }
  }

  user.role = role;
  await user.save();

  return successResponse(res, {
    message: "User role updated successfully.",
    data: { user: sanitizeUser(user) },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean.");
  }

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot suspend your own account.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  if (!isActive && user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin", isActive: true });
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot suspend the last active admin.");
    }
  }

  user.isActive = isActive;
  await user.save();

  return successResponse(res, {
    message: isActive
      ? "User account reactivated."
      : "User account suspended.",
    data: { user: sanitizeUser(user) },
  });
});

const getAdminEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const { status, search } = req.query;

  const filter = {};
  if (status && ["draft", "pending", "published", "rejected", "cancelled", "completed"].includes(status)) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [{ title: buildRegex(search) }, { city: buildRegex(search) }];
  }

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("organizer", "name email"),
    Event.countDocuments(filter),
  ]);

  return successResponse(res, {
    data: events,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found.");

  if (event.status !== "pending") {
    throw new ApiError(400, "Only pending events can be approved.");
  }

  event.status = "published";
  await event.save();

  const { notify } = require("../services/notificationService");
  notify({
    userId: event.organizer,
    title: "Event Approved",
    message: `Your event "${event.title}" has been approved and is now published.`,
    type: "event",
    referenceId: event._id,
  }).catch(() => {});

  return successResponse(res, {
    message: "Event approved and published.",
    data: { event },
  });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found.");

  if (event.status !== "pending") {
    throw new ApiError(400, "Only pending events can be rejected.");
  }

  event.status = "rejected";
  await event.save();

  const { notify } = require("../services/notificationService");
  notify({
    userId: event.organizer,
    title: "Event Rejected",
    message: `Your event "${event.title}" was not approved. Please review and resubmit.`,
    type: "event",
    referenceId: event._id,
  }).catch(() => {});

  return successResponse(res, {
    message: "Event rejected.",
    data: { event },
  });
});

const deleteAdminEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found.");

  await Event.findByIdAndDelete(event._id);

  return successResponse(res, { message: "Event deleted successfully." });
});

const getBookings = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req);
  const [bookings, total] = await Promise.all([
    Booking.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email")
      .populate("event", "title slug"),
    Booking.countDocuments(),
  ]);

  return successResponse(res, {
    data: bookings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getPayments = asyncHandler(async (req, res) => {
  const { page, limit } = paginate(req);
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return successResponse(res, {
    data: payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [users, organizers, events, bookings] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "organizer" }),
    Event.countDocuments(),
    Booking.countDocuments(),
  ]);

  const [eventsByStatus, topCategories] = await Promise.all([
    Event.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ["$category.name", 0] },
          slug: { $arrayElemAt: ["$category.slug", 0] },
          count: 1,
        },
      },
    ]),
  ]);

  const revenueResult = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  return successResponse(res, {
    data: {
      totals: { users, organizers, events, bookings, revenue },
      eventsByStatus,
      topCategories,
    },
  });
});

module.exports = {
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
};