const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [120, "Notification title must be under 120 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Notification message must be under 500 characters"],
    },
    type: {
      type: String,
      enum: ["booking", "payment", "event", "ticket", "account", "system"],
      default: "system",
    },
    isRead: { type: Boolean, default: false },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);