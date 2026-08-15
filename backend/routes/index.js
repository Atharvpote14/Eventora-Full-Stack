const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const eventRoutes = require("./eventRoutes");
const categoryRoutes = require("./categoryRoutes");
const bookingRoutes = require("./bookingRoutes");
const organizerRoutes = require("./organizerRoutes");
const paymentRoutes = require("./paymentRoutes");
const ticketRoutes = require("./ticketRoutes");
const notificationRoutes = require("./notificationRoutes");
const adminRoutes = require("./adminRoutes");
const heroRoutes = require("./heroRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const reviewRoutes = require("./reviewRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/categories", categoryRoutes);
router.use("/bookings", bookingRoutes);
router.use("/organizer", organizerRoutes);
router.use("/payments", paymentRoutes);
router.use("/tickets", ticketRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/reviews", reviewRoutes);
router.use("/hero", heroRoutes);

module.exports = router;