const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const HeroSlide = mongoose.model("HeroSlide", heroSlideSchema);

module.exports = HeroSlide;
