const Event = require("../models/Event");

const priceRange = (ticketTypes) => {
  const prices = (ticketTypes || [])
    .map((t) => t.price)
    .filter((p) => typeof p === "number");
  if (prices.length === 0) return { minPrice: 0, maxPrice: 0 };
  return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
};

const ticketsSold = (ticketTypes) =>
  (ticketTypes || []).reduce((sum, t) => sum + (t.sold || 0), 0);

const serializeListEvent = (event) => {
  const { minPrice, maxPrice } = priceRange(event.ticketTypes);
  return {
    _id: event._id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    category: event.category,
    eventType: event.eventType,
    city: event.city,
    venue: event.venue,
    date: event.date,
    startTime: event.startTime,
    coverImage: event.coverImage,
    heroImage: event.heroImage,
    minPrice,
    maxPrice,
    status: event.status,
  };
};

const serializeDetailEvent = (event) => ({
  ...serializeListEvent(event),
  description: event.description,
  organizer: event.organizer,
  address: event.address,
  endTime: event.endTime,
  registrationDeadline: event.registrationDeadline,
  gallery: event.gallery,
  ticketTypes: event.ticketTypes,
  capacity: event.capacity,
  rules: event.rules,
  requirements: event.requirements,
  faqs: event.faqs,
  featured: event.featured,
  viewCount: event.viewCount,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

const SORT_MAP = {
  date_asc: { date: 1 },
  date_desc: { date: -1 },
  price_asc: { minPrice: 1 },
  price_desc: { minPrice: -1 },
  newest: { createdAt: -1 },
  popular: { ticketsSold: -1, viewCount: -1 },
};

const DEFAULT_SORT = { date: 1 };

const buildListQuery = (query = {}) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    city,
    date,
    minPrice,
    maxPrice,
    sort = "date_asc",
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const match = { status: "published" };

  if (search) {
    const regex = new RegExp(
      String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    match.$or = [{ title: regex }, { description: regex }, { venue: regex }, { city: regex }];
  }

  if (category) match.category = category;
  if (city) match.city = { $regex: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };

  if (date) {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    if (!isNaN(dayStart) && !isNaN(dayEnd)) {
      match.date = { $gte: dayStart, $lte: dayEnd };
    }
  }

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        minPrice: {
          $min: { $map: { input: "$ticketTypes", as: "t", in: "$$t.price" } },
        },
        maxPrice: {
          $max: { $map: { input: "$ticketTypes", as: "t", in: "$$t.price" } },
        },
        ticketsSold: {
          $sum: { $map: { input: "$ticketTypes", as: "t", in: "$$t.sold" } },
        },
      },
    },
  ];

  const priceMatch = {};
  if (minPrice !== undefined && !isNaN(Number(minPrice)))
    priceMatch.minPrice = { $gte: Number(minPrice) };
  if (maxPrice !== undefined && !isNaN(Number(maxPrice)))
    priceMatch.maxPrice = { $lte: Number(maxPrice) };
  if (Object.keys(priceMatch).length > 0) pipeline.push({ $match: priceMatch });

  pipeline.push({ $sort: SORT_MAP[sort] || DEFAULT_SORT });
  pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });
  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryData",
    },
  });
  pipeline.push({
    $addFields: {
      category: { $arrayElemAt: ["$categoryData", 0] },
    },
  });
  pipeline.push({
    $project: { categoryData: 0 },
  });

  return { pipeline, pageNum, limitNum, match, priceMatch };
};

const countEvents = async (match) =>
  Event.countDocuments(match).catch(() => 0);

module.exports = {
  priceRange,
  ticketsSold,
  serializeListEvent,
  serializeDetailEvent,
  buildListQuery,
  countEvents,
  SORT_MAP,
};