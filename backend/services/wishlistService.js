const Wishlist = require("../models/Wishlist");
const Event = require("../models/Event");
const ApiError = require("../utils/ApiError");

const serializeWishlistItem = (item) => ({
  _id: item._id,
  event: item.event
    ? {
        _id: item.event._id,
        title: item.event.title,
        slug: item.event.slug,
        date: item.event.date,
        city: item.event.city,
        venue: item.event.venue,
        coverImage: item.event.coverImage,
        status: item.event.status,
        ticketTypes: item.event.ticketTypes,
      }
    : null,
  createdAt: item.createdAt,
});

const getWishlist = async (userId, { page, limit }) => {
  const [items, total] = await Promise.all([
    Wishlist.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        "event",
        "title slug date city venue coverImage status ticketTypes"
      ),
    Wishlist.countDocuments({ user: userId }),
  ]);
  return { items: items.map(serializeWishlistItem), total };
};

const addToWishlist = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found.");

  const existing = await Wishlist.findOne({ user: userId, event: eventId });
  if (existing) return { item: serializeWishlistItem(existing), created: false };

  const item = await Wishlist.create({ user: userId, event: eventId });
  return { item: serializeWishlistItem(item), created: true };
};

const removeFromWishlist = async (userId, eventId) => {
  const result = await Wishlist.deleteOne({ user: userId, event: eventId });
  return result.deletedCount > 0;
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
