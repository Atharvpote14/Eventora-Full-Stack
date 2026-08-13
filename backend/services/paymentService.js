const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Ticket = require("../models/Ticket");
const ApiError = require("../utils/ApiError");
const { releaseTickets } = require("./bookingService");

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
  refundId: payment.refundId,
  refundAmount: payment.refundAmount,
  refundStatus: payment.refundStatus,
  refundedAt: payment.refundedAt,
  createdAt: payment.createdAt,
});

const initiateRefund = async ({ paymentId, requestedById, isAdmin }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment not found.");
  if (payment.status === "refunded") {
    throw new ApiError(400, "This payment has already been refunded.");
  }
  if (payment.status !== "successful") {
    throw new ApiError(400, `A ${payment.status} payment cannot be refunded.`);
  }
  if (!payment.razorpayPaymentId) {
    throw new ApiError(400, "This payment has no Razorpay payment reference.");
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking) throw new ApiError(404, "Booking not found.");

  const isOwner = booking.user.toString() === requestedById.toString();

  if (!isAdmin && !isOwner) {
    const Event = require("../models/Event");
    const event = await Event.findById(payment.event);
    if (!event || event.organizer.toString() !== requestedById.toString()) {
      throw new ApiError(403, "You are not authorized to refund this payment.");
    }
  }

  if (booking.paymentStatus !== "paid") {
    throw new ApiError(400, "The booking is not paid, so it cannot be refunded.");
  }

  const refundAmount = Math.round(booking.amount * 100);

  let refund;
  try {
    refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmount,
      notes: {
        bookingReference: booking.bookingReference,
      },
    });
  } catch (err) {
    throw new ApiError(
      502,
      "Refund could not be processed at the payment gateway. Please try again later."
    );
  }

  payment.refundId = refund.id || "";
  payment.refundAmount = booking.amount;
  payment.refundStatus = refund.status || "processed";
  payment.refundedAt = new Date();
  payment.status = "refunded";
  await payment.save();

  await Ticket.updateMany(
    { booking: booking._id },
    { $set: { status: "cancelled" } }
  );

  await releaseTickets(booking.event, booking.ticketTypeId, booking.quantity);

  booking.paymentStatus = "refunded";
  booking.bookingStatus = "refunded";
  booking.expiresAt = null;
  await booking.save();

  return {
    refundId: payment.refundId,
    refundAmount: booking.amount,
    refundStatus: payment.refundStatus,
    bookingId: booking._id,
    bookingReference: booking.bookingReference,
  };
};

module.exports = {
  razorpay,
  createRazorpayOrder,
  fetchRazorpayOrder,
  verifyRazorpaySignature,
  validateWebhookSignature,
  serializePayment,
  initiateRefund,
};