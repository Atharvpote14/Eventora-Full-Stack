const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../services/wishlistService");

const getMyWishlist = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const { items, total } = await getWishlist(req.user._id, { page, limit });

  return successResponse(res, {
    data: { items },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const addEventToWishlist = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }

  const { item, created } = await addToWishlist(req.user._id, eventId);

  return successResponse(res, {
    status: created ? 201 : 200,
    message: created
      ? "Event added to wishlist."
      : "Event is already in your wishlist.",
    data: { item },
  });
});

const removeEventFromWishlist = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID.");
  }

  const removed = await removeFromWishlist(req.user._id, eventId);

  return successResponse(res, {
    message: removed
      ? "Event removed from wishlist."
      : "Event was not in your wishlist.",
    data: { removed },
  });
});

module.exports = {
  getMyWishlist,
  addEventToWishlist,
  removeEventFromWishlist,
};