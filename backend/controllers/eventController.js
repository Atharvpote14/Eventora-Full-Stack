const mongoose = require("mongoose");
const Event = require("../models/Event");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uniqueSlug } = require("../services/slugService");
const {
  buildListQuery,
  serializeListEvent,
  serializeDetailEvent,
} = require("../services/eventService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isOrganizerOrAdmin = (user) => ["organizer", "admin"].includes(user.role);

const resolveCategory = async (categoryValue) => {
  if (!categoryValue) return null;
  const category = isValidObjectId(categoryValue)
    ? await Category.findById(categoryValue)
    : await Category.findOne({ slug: categoryValue.toLowerCase() });
  return category;
};

const loadEvent = async (id) => {
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid event ID.");
  const event = await Event.findById(id)
    .populate("category", "name slug image")
    .populate("organizer", "name email profileImage");
  if (!event) throw new ApiError(404, "Event not found.");
  return event;
};

const checkOwnership = (event, user) => {
  if (user.role === "admin") return;
  if (event.organizer._id.toString() !== user._id.toString()) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
};

const parseDateFilter = (date) => {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  if (isNaN(start) || isNaN(end)) return null;
  return { $gte: start, $lte: end };
};

const getEvents = asyncHandler(async (req, res) => {
  const { pipeline, pageNum, limitNum, match, priceMatch } = buildListQuery(
    req.query
  );

  const category = await resolveCategory(req.query.category);
  if (req.query.category && !category) {
    return successResponse(res, { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } });
  }
  if (category) match.category = category._id;

  if (req.query.date) {
    const range = parseDateFilter(req.query.date);
    if (range) match.date = range;
  }

  const countPipeline = [
    { $match: match },
    {
      $addFields: {
        minPrice: { $min: { $map: { input: "$ticketTypes", as: "t", in: "$$t.price" } } },
        maxPrice: { $max: { $map: { input: "$ticketTypes", as: "t", in: "$$t.price" } } },
      },
    },
  ];
  if (Object.keys(priceMatch).length > 0) countPipeline.push({ $match: priceMatch });
  countPipeline.push({ $count: "total" });

  const [countResult, events] = await Promise.all([
    Event.aggregate(countPipeline),
    Event.aggregate(pipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;

  return successResponse(res, {
    data: events.map(serializeListEvent),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    status: "published",
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(12)
    .populate("category", "name slug image");

  return successResponse(res, { data: events.map(serializeListEvent) });
});

const getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    status: "published",
    featured: true,
    date: { $gte: new Date() },
  })
    .sort({ date: 1 })
    .limit(12)
    .populate("category", "name slug image");

  return successResponse(res, { data: events.map(serializeListEvent) });
});

const getPopularEvents = asyncHandler(async (req, res) => {
  const events = await Event.aggregate([
    { $match: { status: "published", date: { $gte: new Date() } } },
    {
      $addFields: {
        ticketsSold: { $sum: { $map: { input: "$ticketTypes", as: "t", in: "$$t.sold" } } },
      },
    },
    { $sort: { ticketsSold: -1, viewCount: -1, date: 1 } },
    { $limit: 12 },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    { $addFields: { category: { $arrayElemAt: ["$categoryData", 0] } } },
    { $project: { categoryData: 0 } },
  ]);

  return successResponse(res, { data: events.map(serializeListEvent) });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await loadEvent(req.params.id);

  if (event.status !== "published") {
    if (!req.user || !isOrganizerOrAdmin(req.user)) {
      throw new ApiError(404, "Event not found.");
    }
    checkOwnership(event, req.user);
  } else {
    await Event.updateOne({ _id: event._id }, { $inc: { viewCount: 1 } });
    event.viewCount += 1;
  }

  return successResponse(res, { data: { event: serializeDetailEvent(event) } });
});

const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug })
    .populate("category", "name slug image")
    .populate("organizer", "name email profileImage");

  if (!event || (event.status !== "published" && (!req.user || !isOrganizerOrAdmin(req.user)))) {
    throw new ApiError(404, "Event not found.");
  }

  if (event.status === "published") {
    await Event.updateOne({ _id: event._id }, { $inc: { viewCount: 1 } });
    event.viewCount += 1;
  }

  return successResponse(res, { data: { event: serializeDetailEvent(event) } });
});

const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category: categoryValue,
    eventType,
    date,
    startTime,
    endTime,
    registrationDeadline,
    venue,
    address,
    city,
    ticketTypes,
    coverImage,
    gallery,
    rules,
    requirements,
    faqs,
  } = req.body;

  const category = await resolveCategory(categoryValue);
  if (!category || !category.isActive) {
    throw new ApiError(400, "Invalid or inactive category.");
  }

  const slug = await uniqueSlug(Event, title);
  const capacity = ticketTypes.reduce((sum, t) => sum + t.capacity, 0);

  const event = await Event.create({
    title: title.trim(),
    slug,
    description,
    category: category._id,
    organizer: req.user._id,
    eventType: eventType || "other",
    date: new Date(date),
    startTime,
    endTime: endTime || "",
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
    venue: venue.trim(),
    address: address.trim(),
    city: city.trim(),
    ticketTypes,
    capacity,
    coverImage: coverImage || "",
    gallery: gallery || [],
    rules: rules || [],
    requirements: requirements || [],
    faqs: faqs || [],
  });

  return successResponse(
    res,
    {
      status: 201,
      message: "Event created successfully.",
      data: { event: serializeDetailEvent(event) },
    }
  );
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await loadEvent(req.params.id);
  checkOwnership(event, req.user);

  if (event.status === "cancelled" || event.status === "completed") {
    throw new ApiError(400, `A ${event.status} event cannot be edited.`);
  }

  const update = {};
  const { title, description, category: categoryValue, eventType, date, startTime, endTime, registrationDeadline, venue, address, city, ticketTypes, coverImage, gallery, rules, requirements, faqs } = req.body;

  if (title !== undefined) {
    update.title = title.trim();
    if (update.title !== event.title) {
      update.slug = await uniqueSlug(Event, update.title, event._id);
    }
  }
  if (description !== undefined) update.description = description;
  if (categoryValue !== undefined) {
    const category = await resolveCategory(categoryValue);
    if (!category || !category.isActive) throw new ApiError(400, "Invalid or inactive category.");
    update.category = category._id;
  }
  if (eventType !== undefined) update.eventType = eventType;
  if (date !== undefined) update.date = new Date(date);
  if (startTime !== undefined) update.startTime = startTime;
  if (endTime !== undefined) update.endTime = endTime;
  if (registrationDeadline !== undefined) update.registrationDeadline = new Date(registrationDeadline);
  if (venue !== undefined) update.venue = venue.trim();
  if (address !== undefined) update.address = address.trim();
  if (city !== undefined) update.city = city.trim();
  if (coverImage !== undefined) update.coverImage = coverImage;
  if (gallery !== undefined) update.gallery = gallery;
  if (rules !== undefined) update.rules = rules;
  if (requirements !== undefined) update.requirements = requirements;
  if (faqs !== undefined) update.faqs = faqs;

  if (ticketTypes !== undefined) {
    update.ticketTypes = ticketTypes;
    update.capacity = ticketTypes.reduce((sum, t) => sum + t.capacity, 0);
  }

  const updated = await Event.findByIdAndUpdate(event._id, update, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name slug image")
    .populate("organizer", "name email profileImage");

  return successResponse(res, {
    message: "Event updated successfully.",
    data: { event: serializeDetailEvent(updated) },
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await loadEvent(req.params.id);
  checkOwnership(event, req.user);

  await Event.findByIdAndDelete(event._id);

  return successResponse(res, { message: "Event deleted successfully." });
});

const publishEvent = asyncHandler(async (req, res) => {
  const event = await loadEvent(req.params.id);
  checkOwnership(event, req.user);

  if (event.status === "cancelled" || event.status === "completed") {
    throw new ApiError(400, `A ${event.status} event cannot be published.`);
  }

  if (!event.coverImage || event.ticketTypes.length === 0) {
    throw new ApiError(400, "Add a cover image and at least one ticket type before publishing.");
  }

  if (new Date(event.date) < new Date()) {
    throw new ApiError(400, "Cannot publish an event in the past.");
  }

  event.status = "pending";
  await event.save();

  return successResponse(res, {
    message: "Event submitted for review. An admin will approve it for publication.",
    data: { event: serializeDetailEvent(event) },
  });
});

const cancelEvent = asyncHandler(async (req, res) => {
  const event = await loadEvent(req.params.id);
  checkOwnership(event, req.user);

  if (event.status === "completed") {
    throw new ApiError(400, "A completed event cannot be cancelled.");
  }

  event.status = "cancelled";
  await event.save();

  return successResponse(res, {
    message: "Event cancelled successfully.",
    data: { event: serializeDetailEvent(event) },
  });
});

module.exports = {
  getEvents,
  getUpcomingEvents,
  getFeaturedEvents,
  getPopularEvents,
  getEventById,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
};