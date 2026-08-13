const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  getEventReviews,
  createReview,
  updateReview,
  deleteReview,
  serializeReview,
} = require("../services/reviewService");

const validateRating = (rating) => {
  if (rating === undefined) return;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5.");
  }
};

const validateComment = (comment) => {
  if (comment === undefined) return;
  if (typeof comment !== "string" || !comment.trim()) {
    throw new ApiError(400, "Review comment is required.");
  }
  if (comment.trim().length > 1000) {
    throw new ApiError(400, "Review must be under 1000 characters.");
  }
};

const getEventReviewsController = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const { reviews, total } = await getEventReviews(eventId, { page, limit });

  return successResponse(res, {
    message: "Reviews fetched successfully.",
    data: { reviews },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const createEventReview = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }

  const { rating, comment } = req.body;
  validateRating(rating);
  validateComment(comment);
  if (rating === undefined || comment === undefined) {
    throw new ApiError(400, "Both rating and comment are required.");
  }

  const review = await createReview(req.user._id, eventId, {
    rating,
    comment: comment.trim(),
  });

  return successResponse(res, {
    status: 201,
    message: "Review submitted successfully.",
    data: { review: serializeReview(review) },
  });
});

const updateEventReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid review ID.");
  }

  const { rating, comment } = req.body;
  validateRating(rating);
  validateComment(comment);
  if (rating === undefined && comment === undefined) {
    throw new ApiError(400, "Provide a rating or comment to update.");
  }

  const review = await updateReview(id, req.user._id, {
    rating,
    comment: comment !== undefined ? comment.trim() : undefined,
  });

  return successResponse(res, {
    message: "Review updated successfully.",
    data: { review: serializeReview(review) },
  });
});

const deleteEventReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid review ID.");
  }

  await deleteReview(id, req.user);

  return successResponse(res, {
    message: "Review deleted successfully.",
    data: { deleted: true },
  });
});

module.exports = {
  getEventReviewsController,
  createEventReview,
  updateEventReview,
  deleteEventReview,
};