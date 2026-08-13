const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: [true, "Ticket ID is required"],
      unique: true,
      trim: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    ticketType: { type: String, required: [true, "Ticket type is required"], trim: true },
    qrCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "used", "cancelled", "expired"],
      default: "active",
    },
    checkedInAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ booking: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);