const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { serializeNotification } = require("../services/notificationService");

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { type, unread } = req.query;

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (unread === "true" || unread === "1") filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  return successResponse(res, {
    data: notifications.map(serializeNotification),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  return successResponse(res, { data: { unreadCount: count } });
});

const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid notification ID.");
  }

  const notification = await Notification.findOne({
    _id: id,
    user: req.user._id,
  });
  if (!notification) throw new ApiError(404, "Notification not found.");

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return successResponse(res, {
    message: "Notification marked as read.",
    data: { notification: serializeNotification(notification) },
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return successResponse(res, {
    message: "All notifications marked as read.",
    data: { updated: result.modifiedCount },
  });
});

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead };