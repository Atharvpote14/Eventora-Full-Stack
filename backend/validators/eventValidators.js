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

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id || "");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateTicketTypes = (ticketTypes) => {
  const errors = [];

  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
    return { ticketTypes: "At least one ticket type is required." };
  }

  ticketTypes.forEach((ticket, index) => {
    const prefix = `ticketTypes[${index}]`;

    if (!ticket.name || !ticket.name.trim()) errors.push(`${prefix}.name: Name is required`);
    else if (ticket.name.trim().length > 60) errors.push(`${prefix}.name: Name must be under 60 characters`);

    if (ticket.price === undefined || isNaN(Number(ticket.price)))
      errors.push(`${prefix}.price: Price is required`);
    else if (Number(ticket.price) < 0) errors.push(`${prefix}.price: Price cannot be negative`);

    if (ticket.capacity === undefined || !Number.isInteger(Number(ticket.capacity)) || Number(ticket.capacity) < 1)
      errors.push(`${prefix}.capacity: Capacity must be a positive integer`);
  });

  return errors.length > 0 ? { ticketTypes: errors.join("; ") } : {};
};

const validateEventBase = (body, { partial = false } = {}) => {
  const errors = {};

  const check = (field, label, test) => {
    if (body[field] === undefined) return partial ? undefined : errors[field];
    const value = test();
    if (value) errors[field] = value;
  };

  check("title", "Title", () => {
    const title = (body.title || "").trim();
    if (!title) return "Title is required";
    if (title.length < 3) return "Title must be at least 3 characters";
    if (title.length > 120) return "Title must be under 120 characters";
  });

  check("description", "Description", () => {
    const description = (body.description || "").trim();
    if (!description) return "Description is required";
    if (description.length < 20) return "Description must be at least 20 characters";
  });

  check("category", "Category", () => {
    if (!body.category) return "Category is required";
    if (!isValidObjectId(body.category) && body.category.length > 40) return "Category is invalid";
  });

  check("eventType", "Event type", () => {
    if (body.eventType && !EVENT_TYPES.includes(body.eventType))
      return `Event type must be one of: ${EVENT_TYPES.join(", ")}`;
  });

  check("date", "Date", () => {
    if (!body.date) return "Event date is required";
    const d = new Date(body.date);
    if (isNaN(d)) return "Event date is invalid";
    if (d < new Date()) return "Event date must be in the future";
  });

  check("startTime", "Start time", () => {
    if (!body.startTime) return "Start time is required";
    if (!TIME_REGEX.test(body.startTime)) return "Start time must be in HH:MM format";
  });

  check("endTime", "End time", () => {
    if (body.endTime && !TIME_REGEX.test(body.endTime))
      return "End time must be in HH:MM format";
  });

  check("venue", "Venue", () => {
    if (!(body.venue || "").trim()) return "Venue is required";
  });

  check("address", "Address", () => {
    if (!(body.address || "").trim()) return "Address is required";
  });

  check("city", "City", () => {
    if (!(body.city || "").trim()) return "City is required";
  });

  check("coverImage", "Cover image", () => {
    const image = (body.coverImage || "").trim();
    if (image && !/^https?:\/\/.+/.test(image)) return "Cover image must be a valid URL";
  });

  check("heroImage", "Hero banner image", () => {
    const image = (body.heroImage || "").trim();
    if (image && !/^https?:\/\/.+/.test(image)) return "Hero banner image must be a valid URL";
  });

  if (body.heroImages !== undefined) {
    if (!Array.isArray(body.heroImages)) {
      errors.heroImages = "Hero images must be an array";
    } else {
      const heroErrors = [];
      body.heroImages.forEach((slide, index) => {
        const prefix = `heroImages[${index}]`;
        const image = (slide?.image || "").trim();
        if (!image) heroErrors.push(`${prefix}.image: Image URL is required`);
        else if (!/^https?:\/\/.+/.test(image)) heroErrors.push(`${prefix}.image: Must be a valid URL`);
        if (slide?.link && !/^https?:\/\/.+/.test(slide.link.trim()))
          heroErrors.push(`${prefix}.link: Must be a valid URL`);
      });
      if (heroErrors.length > 0) errors.heroImages = heroErrors.join("; ");
    }
  }

  check("featured", "Featured", () => {
    if (body.featured !== undefined && typeof body.featured !== "boolean")
      return "Featured must be a boolean";
  });

  if (body.ticketTypes !== undefined) {
    const ticketErrors = validateTicketTypes(body.ticketTypes);
    if (ticketErrors.ticketTypes) errors.ticketTypes = ticketErrors.ticketTypes;
  } else if (!partial) {
    errors.ticketTypes = "At least one ticket type is required.";
  }

  if (body.gallery !== undefined && !Array.isArray(body.gallery))
    errors.gallery = "Gallery must be an array of image URLs";

  if (body.rules !== undefined && !Array.isArray(body.rules))
    errors.rules = "Rules must be an array of strings";

  if (body.requirements !== undefined && !Array.isArray(body.requirements))
    errors.requirements = "Requirements must be an array of strings";

  if (body.faqs !== undefined && !Array.isArray(body.faqs))
    errors.faqs = "FAQs must be an array";

  return errors;
};

const validateCreateEvent = (body) => validateEventBase(body);
const validateUpdateEvent = (body) => validateEventBase(body, { partial: true });

module.exports = { validateCreateEvent, validateUpdateEvent };