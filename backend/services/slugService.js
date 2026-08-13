const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uniqueSlug = async (model, base, existingId = null) => {
  let slug = slugify(base) || "event";
  let candidate = slug;
  let suffix = 2;

  while (true) {
    const query = { slug: candidate };
    if (existingId) query._id = { $ne: existingId };

    const existing = await model.findOne(query);
    if (!existing) return candidate;

    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
};

module.exports = { slugify, uniqueSlug };