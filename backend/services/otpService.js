const crypto = require("crypto");
const OtpVerification = require("../models/OtpVerification");

const MAX_ATTEMPTS = 5;

const generateOtp = () =>
  crypto.randomInt(0, 1000000).toString().padStart(6, "0");

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const createOtp = async (email, purpose) => {
  await OtpVerification.deleteMany({ email, purpose });

  const otp = generateOtp();
  const expiresAt = new Date(
    Date.now() + (process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000
  );

  await OtpVerification.create({
    email,
    otpHash: hashOtp(otp),
    purpose,
    expiresAt,
    attempts: 0,
  });

  return otp;
};

const verifyOtp = async (email, otp, purpose) => {
  const record = await OtpVerification.findOne({ email, purpose });

  if (!record) {
    return { ok: false, status: 400, message: "Invalid verification code." };
  }

  if (record.expiresAt < new Date()) {
    await OtpVerification.deleteOne({ _id: record._id });
    return { ok: false, status: 400, message: "Verification code has expired." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await OtpVerification.deleteOne({ _id: record._id });
    return {
      ok: false,
      status: 400,
      message: "Too many invalid attempts. Please request a new code.",
    };
  }

  if (hashOtp(otp) !== record.otpHash) {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      await OtpVerification.deleteOne({ _id: record._id });
    } else {
      await record.save();
    }
    return { ok: false, status: 400, message: "Invalid verification code." };
  }

  await OtpVerification.deleteOne({ _id: record._id });
  return { ok: true };
};

const invalidateOtps = async (email, purpose) => {
  await OtpVerification.deleteMany({ email, purpose });
};

module.exports = { generateOtp, hashOtp, createOtp, verifyOtp, invalidateOtps };