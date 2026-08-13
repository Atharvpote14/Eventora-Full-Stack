const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  createRazorpayOrder,
  fetchRazorpayOrder,
  verifyRazorpaySignature,
  validateWebhookSignature,
  serializePayment,
  initiateRefund,
} = require("../services/paymentService");
const { expirePendingBookings } = require("../services/bookingService");
const { generateTicketsForBooking } = require("../services/ticketService");
const { sendBookingConfirmationEmail } = require("../services/emailService");

const confirmBooking = async (booking, user) => {
  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";
  booking.expiresAt = null;
  await booking.save();

  const tickets = await generateTicketsForBooking(booking);

  if (tickets.length > 0 && user) {
    const Event = mongoose.model("Event");
    const event = await Event.findById(booking.event).select("title date time venue city");
    sendBookingConfirmationEmail({
      email: user.email,
      name: user.name,
      eventName: event ? event.title : "",
      eventDate: event && event.date ? event.date.toISOString().slice(0, 10) : "",
      eventTime: event ? event.time : "",
      venue: event ? event.venue : "",
      city: event ? event.city : "",
      ticketType: booking.ticketType,
      quantity: booking.quantity,
      total: booking.amount,
      bookingReference: booking.bookingReference,
      ticketNumbers: tickets.map((t) => t.ticketId),
    }).catch(() => {});
  }

  return tickets;
};

const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking ID.");
  }

  await expirePendingBookings();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found.");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }

  if (booking.paymentStatus === "paid") {
    throw new ApiError(400, "This booking is already paid.");
  }
  if (booking.paymentStatus === "refunded" || booking.bookingStatus === "refunded") {
    throw new ApiError(400, "This booking has been refunded.");
  }
  if (booking.bookingStatus === "expired") {
    throw new ApiError(400, "This booking has expired. Please create a new booking.");
  }
  if (booking.bookingStatus === "cancelled") {
    throw new ApiError(400, "This booking has been cancelled.");
  }

  const existingPayment = await Payment.findOne({
    booking: booking._id,
    status: { $in: ["created", "pending"] },
  });
  if (existingPayment) {
    return successResponse(res, {
      message: "An order already exists for this booking.",
      data: {
        orderId: existingPayment.razorpayOrderId,
        amount: Math.round(existingPayment.amount * 100),
        currency: existingPayment.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  }

  const order = await createRazorpayOrder({
    amount: booking.amount,
    receipt: booking.bookingReference,
  });

  const payment = await Payment.create({
    booking: booking._id,
    user: req.user._id,
    event: booking.event,
    razorpayOrderId: order.id,
    amount: booking.amount,
    currency: order.currency,
    status: "created",
  });

  booking.paymentStatus = "created";
  await booking.save();

  return successResponse(res, {
    message: "Razorpay order created.",
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing required payment fields.");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found.");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }

  // Idempotent — already confirmed
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") {
    return successResponse(res, {
      message: "Payment already verified.",
      data: { booking: { id: booking._id, status: "confirmed" } },
    });
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) throw new ApiError(404, "Payment order not found.");

  if (payment.booking.toString() !== booking._id.toString()) {
    throw new ApiError(400, "Payment order does not match this booking.");
  }

  const signatureValid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!signatureValid) {
    throw new ApiError(400, "Payment verification failed. Signature mismatch.");
  }

  // Amount validation — compare against the actual Razorpay order
  const razorpayOrder = await fetchRazorpayOrder(razorpay_order_id);
  const paidPaise = razorpayOrder.amount_paid || razorpayOrder.amount;
  if (paidPaise < Math.round(booking.amount * 100)) {
    throw new ApiError(400, "Paid amount does not match the booking amount.");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "successful";
  payment.method = "razorpay";
  await payment.save();

  await confirmBooking(booking, req.user);

  return successResponse(res, {
    message: "Payment verified successfully.",
    data: { booking: { id: booking._id, status: "confirmed" } },
  });
});

const reportFailure = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking ID.");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found.");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }

  if (booking.paymentStatus === "paid") {
    throw new ApiError(400, "This booking is already paid.");
  }

  const payment = await Payment.findOne({
    booking: booking._id,
    status: { $in: ["created", "pending"] },
  });

  if (payment) {
    payment.status = "failed";
    payment.failureReason = reason || "Payment failed";
    await payment.save();
  }

  booking.paymentStatus = "failed";
  await booking.save();

  return successResponse(res, {
    message: "Payment failure recorded. You can retry payment.",
    data: { booking: { id: booking._id, status: booking.bookingStatus } },
  });
});

const getMyPayments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [payments, total] = await Promise.all([
    Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("booking", "bookingReference bookingStatus")
      .populate("event", "title slug"),
    Payment.countDocuments({ user: req.user._id }),
  ]);

  return successResponse(res, {
    data: payments.map(serializePayment),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const refundPayment = asyncHandler(async (req, res) => {
  const result = await initiateRefund({
    paymentId: req.params.paymentId,
    requestedById: req.user._id,
    isAdmin: req.user.role === "admin",
  });

  return successResponse(res, {
    message: "Refund processed successfully.",
    data: result,
  });
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new ApiError(500, "Webhook secret is not configured.");
  }

  if (!signature || !validateWebhookSignature(rawBody, signature)) {
    throw new ApiError(400, "Invalid webhook signature.");
  }

  req.body = JSON.parse(rawBody);
  const { event, payload } = req.body;

  if (event === "payment.captured") {
    const { order_id, id, amount } = payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: order_id });

    if (payment) {
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.bookingStatus !== "confirmed") {
        if (amount >= Math.round(booking.amount * 100)) {
          payment.razorpayPaymentId = id;
          payment.status = "successful";
          await payment.save();

          const User = mongoose.model("User");
          const user = await User.findById(booking.user);
          await confirmBooking(booking, user);
        }
      }
    }
  }

  if (event === "payment.failed") {
    const { order_id } = payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: order_id });
    if (payment) {
      payment.status = "failed";
      payment.failureReason = payload.payment.entity.error_description || "Payment failed";
      await payment.save();

      const booking = await Booking.findById(payment.booking);
      if (booking && booking.paymentStatus !== "paid") {
        booking.paymentStatus = "failed";
        await booking.save();
      }
    }
  }

  if (event === "refund.processed") {
    const { payment_id, id, status } = payload.refund.entity;
    const payment = await Payment.findOne({ razorpayPaymentId: payment_id });
    if (payment && payment.status !== "refunded") {
      payment.refundId = id || payment.refundId;
      payment.refundStatus = status || "processed";
      payment.refundedAt = new Date();
      payment.status = "refunded";
      await payment.save();

      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = "refunded";
        booking.bookingStatus = "refunded";
        await booking.save();
        await mongoose.model("Ticket").updateMany(
          { booking: booking._id },
          { $set: { status: "cancelled" } }
        );
        const { releaseTickets } = require("../services/bookingService");
        await releaseTickets(booking.event, booking.ticketTypeId, booking.quantity);
      }
    }
  }

  return successResponse(res, { message: "Webhook processed." });
});

module.exports = {
  createOrder,
  verifyPayment,
  reportFailure,
  getMyPayments,
  refundPayment,
  handleWebhook,
};