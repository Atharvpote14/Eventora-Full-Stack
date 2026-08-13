const mongoose = require("mongoose");

const TICKET_STATUSES = ["active", "used", "cancelled", "expired"];

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: "active",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ ticketId: 1 }, { unique: true });
ticketSchema.index({ user: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ booking: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;