const Notification = require("../models/Notification");

const notify = async ({ userId, title, message, type, referenceId = null }) => {
  return Notification.create({
    user: userId,
    title,
    message,
    type,
    referenceId,
  });
};

const notifyMany = async ({ userIds, title, message, type, referenceId = null }) => {
  const uniqueIds = [...new Set(userIds.map((id) => id.toString()))];
  if (uniqueIds.length === 0) return [];

  return Notification.insertMany(
    uniqueIds.map((userId) => ({
      user: userId,
      title,
      message,
      type,
      referenceId,
    }))
  );
};

const serializeNotification = (n) => ({
  _id: n._id,
  title: n.title,
  message: n.message,
  type: n.type,
  isRead: n.isRead,
  referenceId: n.referenceId,
  createdAt: n.createdAt,
});

module.exports = { notify, notifyMany, serializeNotification };