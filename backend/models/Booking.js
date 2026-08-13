const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: [true, "Booking reference is required"],
      unique: true,
      trim: true,
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
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Ticket type is required"],
    },
    ticketType: { type: String, required: [true, "Ticket type name is required"], trim: true },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [20, "Quantity cannot exceed 20 per booking"],
    },
    subtotal: { type: Number, required: [true, "Subtotal is required"], min: [0, "Subtotal cannot be negative"] },
    discount: { type: Number, default: 0, min: [0, "Discount cannot be negative"] },
    platformFee: { type: Number, default: 0, min: [0, "Platform fee cannot be negative"] },
    tax: { type: Number, default: 0, min: [0, "Tax cannot be negative"] },
    total: { type: Number, required: [true, "Total is required"], min: [0, "Total cannot be negative"] },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired", "failed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
