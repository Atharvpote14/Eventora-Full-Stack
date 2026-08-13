const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ticket type name is required"],
      trim: true,
      maxlength: [60, "Ticket type name must be under 60 characters"],
    },
    price: {
      type: Number,
      required: [true, "Ticket price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    capacity: {
      type: Number,
      required: [true, "Ticket capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    sold: { type: Number, default: 0, min: [0, "Sold cannot be negative"] },
    description: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { _id: true }
);

ticketTypeSchema.virtual("available").get(function () {
  return Math.max(this.capacity - this.sold, 0);
});

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, "FAQ question is required"], trim: true },
    answer: { type: String, required: [true, "FAQ answer is required"], trim: true },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [120, "Event title must be under 120 characters"],
    },
    slug: {
      type: String,
      required: [true, "Event slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [140, "Event slug must be under 140 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [10000, "Event description must be under 10000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    coverImage: { type: String, default: "" },
    gallery: [{ type: String }],
    eventType: {
      type: String,
      enum: [
        "conference",
        "workshop",
        "concert",
        "sports",
        "gaming",
        "education",
        "business",
        "entertainment",
        "festival",
        "comedy",
        "food",
        "arts",
        "theatre",
        "other",
      ],
      default: "other",
    },
    date: { type: Date, required: [true, "Event date is required"] },
    startTime: { type: String, required: [true, "Start time is required"], trim: true },
    endTime: { type: String, default: "", trim: true },
    registrationDeadline: { type: Date },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    address: { type: String, required: [true, "Address is required"], trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    ticketTypes: { type: [ticketTypeSchema], default: [] },
    capacity: {
      type: Number,
      required: [true, "Event capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "cancelled", "completed"],
      default: "draft",
    },
    rejectionReason: { type: String, default: "", trim: true },
    featured: { type: Boolean, default: false },
    rules: [{ type: String }],
    requirements: [{ type: String }],
    faqs: [faqSchema],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Event", eventSchema);
