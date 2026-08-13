const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async ({ amount, receipt }) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    payment_capture: 1,
  });
};

const fetchRazorpayOrder = (orderId) => razorpay.orders.fetch(orderId);

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
};

const validateWebhookSignature = (rawBody, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

const serializePayment = (payment) => ({
  _id: payment._id,
  booking: payment.booking,
  event: payment.event,
  razorpayOrderId: payment.razorpayOrderId,
  razorpayPaymentId: payment.razorpayPaymentId,
  amount: payment.amount,
  currency: payment.currency,
  status: payment.status,
  method: payment.method,
  failureReason: payment.failureReason,
  createdAt: payment.createdAt,
});

module.exports = {
  razorpay,
  createRazorpayOrder,
  fetchRazorpayOrder,
  verifyRazorpaySignature,
  validateWebhookSignature,
  serializePayment,
};