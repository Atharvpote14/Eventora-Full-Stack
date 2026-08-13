const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "forgot-password"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

otpVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OtpVerification = mongoose.model(
  "OtpVerification",
  otpVerificationSchema
);

module.exports = OtpVerification;