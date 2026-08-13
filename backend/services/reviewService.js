const Review = require("../models/Review");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");

const serializeReview = (review) => ({
  _id: review._id,
  event: review.event,
  rating: review.rating,
  comment: review.comment,
  user: review.user
    ? { _id: review.user._id, name: review.user.name }
    : null,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const getEventReviews = async (eventId, { page, limit }) => {
  const event = await Event.exists({ _id: eventId });
  if (!event) throw new ApiError(404, "Event not found.");

  const [reviews, total] = await Promise.all([
    Review.find({ event: eventId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name"),
    Review.countDocuments({ event: eventId }),
  ]);
  return { reviews: reviews.map(serializeReview), total };
};

const getRatingSummary = async (eventId) => {
  const [agg] = await Review.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return {
    averageRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
    reviewCount: agg ? agg.count : 0,
  };
};

const createReview = async (userId, eventId, { rating, comment }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  const booking = await Booking.findOne({
    event: eventId,
    user: userId,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
  });
  if (!booking) {
    throw new ApiError(
      403,
      "Only attendees with a confirmed paid booking can review this event."
    );
  }

  const existing = await Review.findOne({ user: userId, event: eventId });
  if (existing) {
    throw new ApiError(400, "You have already reviewed this event.");
  }

  const review = await Review.create({ user: userId, event: eventId, rating, comment });
  return review.populate("user", "name");
};

const updateReview = async (reviewId, userId, { rating, comment }) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found.");
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the review owner can update this review.");
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();
  return review.populate("user", "name");
};

const deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found.");

  const isOwner = review.user.toString() === user._id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Only the review owner or an admin can delete this review.");
  }

  await review.deleteOne();
};

module.exports = {
  getEventReviews,
  getRatingSummary,
  createReview,
  updateReview,
  deleteReview,
  serializeReview,
};
