const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    otpHash: { type: String, required: [true, "OTP hash is required"] },
    purpose: {
      type: String,
      enum: ["registration", "forgot-password"],
      required: [true, "Purpose is required"],
    },
    expiresAt: { type: Date, required: [true, "Expiry is required"] },
    attempts: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpVerificationSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);