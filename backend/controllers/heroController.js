const HeroSlide = require("../models/HeroSlide");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");

const serializeSlide = (slide) => ({
  _id: slide._id,
  image: slide.image,
  link: slide.link,
  isActive: slide.isActive,
  createdAt: slide.createdAt,
});

const listActiveSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find({ isActive: true }).sort({ createdAt: 1 });
  return successResponse(res, { data: slides.map(serializeSlide) });
});

const listAllSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find().sort({ createdAt: -1 });
  return successResponse(res, { data: slides.map(serializeSlide) });
});

const createSlide = asyncHandler(async (req, res) => {
  const { image, link } = req.body;
  const slide = await HeroSlide.create({
    image: (image || "").trim(),
    link: (link || "").trim(),
    addedBy: req.user._id,
  });
  return successResponse(res, {
    status: 201,
    message: "Hero image added.",
    data: { slide: serializeSlide(slide) },
  });
});

const updateSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) throw new ApiError(404, "Hero image not found.");

  const update = {};
  if (req.body.image !== undefined) update.image = req.body.image.trim();
  if (req.body.link !== undefined) update.link = req.body.link.trim();
  if (req.body.isActive !== undefined) update.isActive = Boolean(req.body.isActive);

  const updated = await HeroSlide.findByIdAndUpdate(slide._id, update, {
    new: true,
    runValidators: true,
  });
  return successResponse(res, {
    message: "Hero image updated.",
    data: { slide: serializeSlide(updated) },
  });
});

const deleteSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) throw new ApiError(404, "Hero image not found.");
  await HeroSlide.findByIdAndDelete(slide._id);
  return successResponse(res, { message: "Hero image deleted." });
});

module.exports = {
  listActiveSlides,
  listAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
};
