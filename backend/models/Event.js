const mongoose = require("mongoose");

const EVENT_TYPES = [
  "conference",
  "workshop",
  "concert",
  "sports",
  "gaming",
  "education",
  "business",
  "entertainment",
  "festival",
  "other",
];

const EVENT_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
  "cancelled",
  "completed",
];

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    heroImage: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      default: "other",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      default: "",
    },
    registrationDeadline: {
      type: Date,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      default: [],
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: "draft",
    },
    rules: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ slug: 1 }, { unique: true });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;