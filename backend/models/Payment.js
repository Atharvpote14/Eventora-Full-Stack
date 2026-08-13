const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    amount: { type: Number, required: [true, "Amount is required"], min: [0, "Amount cannot be negative"] },
    currency: { type: String, default: "INR", trim: true },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "created",
    },
    method: { type: String, default: "", trim: true },
    failureReason: { type: String, default: "", trim: true },
    refundId: { type: String, default: "", trim: true },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundStatus: {
      type: String,
      enum: ["", "pending", "processed", "failed"],
      default: "",
    },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
