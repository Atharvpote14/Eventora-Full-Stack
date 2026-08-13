const mongoose = require("mongoose");

const PAYMENT_STATUSES = ["pending", "created", "paid", "failed", "refunded", "cancelled"];
const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed", "expired", "refunded", "failed"];

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      trim: true,
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
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;