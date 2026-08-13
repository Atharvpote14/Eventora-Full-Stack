const express = require("express");

const {
  createOrder,
  verifyPayment,
  reportFailure,
  getMyPayments,
  refundPayment,
  handleWebhook,
} = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

const validateCreateOrder = (body) => {
  const errors = {};
  if (!body.bookingId) errors.bookingId = "bookingId is required";
  return errors;
};

const validateVerify = (body) => {
  const errors = {};
  if (!body.bookingId) errors.bookingId = "bookingId is required";
  if (!body.razorpay_order_id) errors.razorpay_order_id = "razorpay_order_id is required";
  if (!body.razorpay_payment_id) errors.razorpay_payment_id = "razorpay_payment_id is required";
  if (!body.razorpay_signature) errors.razorpay_signature = "razorpay_signature is required";
  return errors;
};

router.post(
  "/create-order",
  authenticate,
  validate(validateCreateOrder),
  createOrder
);

router.post(
  "/verify",
  authenticate,
  validate(validateVerify),
  verifyPayment
);

router.post(
  "/failure",
  authenticate,
  validate((body) => (body.bookingId ? {} : { bookingId: "bookingId is required" })),
  reportFailure
);

router.get("/my", authenticate, getMyPayments);

// Refund: admin or event organizer only
router.post("/:paymentId/refund", authenticate, authorize("organizer", "admin"), refundPayment);

// Raw body required for signature validation
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

module.exports = router;