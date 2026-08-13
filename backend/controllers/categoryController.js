const Category = require("../models/Category");
const Event = require("../models/Event");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { slugify, uniqueSlug } = require("../services/slugService");
const mongoose = require("mongoose");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({
    name: 1,
  });
  return successResponse(res, { data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const slug = await uniqueSlug(Category, name);

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description?.trim() || "",
    image: image || "",
  });

  return successResponse(
    res,
    {
      status: 201,
      message: "Category created successfully.",
      data: { category },
    }
  );
});

const updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");

  const { name, description, image, isActive } = req.body;

  if (name !== undefined) {
    category.name = name.trim();
    category.slug = await uniqueSlug(Category, name, category._id);
  }
  if (description !== undefined) category.description = description.trim();
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  return successResponse(res, {
    message: "Category updated successfully.",
    data: { category },
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");

  const eventCount = await Event.countDocuments({ category: category._id });
  if (eventCount > 0) {
    throw new ApiError(
      400,
      `Category has ${eventCount} event(s). Deactivate it instead of deleting.`
    );
  }

  await Category.findByIdAndDelete(category._id);

  return successResponse(res, { message: "Category deleted successfully." });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};