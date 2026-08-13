const crypto = require("crypto");
const QRCode = require("qrcode");
const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");

const TICKET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateTicketId = () => {
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += TICKET_ALPHABET[bytes[i] % TICKET_ALPHABET.length];
  }
  return `EVT-TKT-${out}`;
};

const signTicketPayload = (ticketId) => {
  const sig = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(ticketId)
    .digest("hex")
    .slice(0, 16);
  return `${ticketId}.${sig}`;
};

const parseTicketPayload = (payload) => {
  const trimmed = String(payload || "").trim();
  if (/^EVT-TKT-[A-Z2-9]{6}$/.test(trimmed)) {
    return { ticketId: trimmed, signed: false };
  }
  const [ticketId, sig] = trimmed.split(".");
  if (!ticketId || !sig || !/^EVT-TKT-[A-Z2-9]{6}$/.test(ticketId)) {
    return null;
  }
  const expected = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(ticketId)
    .digest("hex")
    .slice(0, 16);
  if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
    return { ticketId, signed: true };
  }
  return null;
};

const generateTicketsForBooking = async (booking) => {
  if (!booking || booking.bookingStatus !== "confirmed") return [];

  const existing = await Ticket.countDocuments({ booking: booking._id });
  if (existing > 0) return [];

  const tickets = [];
  for (let i = 0; i < booking.quantity; i += 1) {
    let ticketId = generateTicketId();
    let attempts = 0;
    while (attempts < 5 && (await Ticket.exists({ ticketId }))) {
      ticketId = generateTicketId();
      attempts += 1;
    }
    if (attempts >= 5) {
      throw new ApiError(500, "Failed to generate a unique ticket number. Please retry.");
    }

    tickets.push({
      ticketId,
      booking: booking._id,
      user: booking.user,
      event: booking.event,
      ticketType: booking.ticketType,
      qrCode: signTicketPayload(ticketId),
      status: "active",
    });
  }

  const created = await Ticket.insertMany(tickets);
  return created;
};

const getTicketForResponse = async (ticketId) => {
  const ticket = await Ticket.findOne({ ticketId })
    .populate("event", "title date time venue city slug")
    .populate("user", "name email")
    .populate("booking", "bookingReference");
  if (!ticket) throw new ApiError(404, "Ticket not found.");
  return ticket;
};

const serializeTicket = async (ticket) => {
  const qrCodeImage = await QRCode.toDataURL(ticket.qrCode);
  return {
    _id: ticket._id,
    ticketNumber: ticket.ticketId,
    bookingReference: ticket.booking ? ticket.booking.bookingReference : null,
    event: ticket.event
      ? {
          _id: ticket.event._id,
          title: ticket.event.title,
          date: ticket.event.date,
          time: ticket.event.time,
          venue: ticket.event.venue,
          city: ticket.event.city,
          slug: ticket.event.slug,
        }
      : null,
    ticketType: ticket.ticketType,
    user: ticket.user ? { name: ticket.user.name, email: ticket.user.email } : null,
    status: ticket.status,
    checkedInAt: ticket.checkedInAt,
    qrCode: ticket.qrCode,
    qrCodeImage,
  };
};

const verifyTicket = async ({ payload, verifierId, isAdmin }) => {
  const parsed = parseTicketPayload(payload);
  if (!parsed) throw new ApiError(400, "Invalid ticket number or QR code.");

  const ticket = await getTicketForResponse(parsed.ticketId);

  if (!isAdmin) {
    const Event = require("../models/Event");
    const event = await Event.findById(ticket.event._id);
    if (!event) throw new ApiError(404, "Ticket not found.");
    if (event.organizer.toString() !== verifierId.toString()) {
      throw new ApiError(403, "You can only verify tickets for your own events.");
    }
  }

  if (ticket.status === "used") {
    throw new ApiError(400, "This ticket has already been used.");
  }
  if (ticket.status === "cancelled") {
    throw new ApiError(400, "This ticket has been cancelled.");
  }
  if (ticket.status === "expired") {
    throw new ApiError(400, "This ticket has expired.");
  }

  ticket.status = "used";
  ticket.checkedInAt = new Date();
  await ticket.save();

  return {
    verified: true,
    ticketNumber: ticket.ticketId,
    eventTitle: ticket.event.title,
    ticketType: ticket.ticketType,
    attendee: ticket.user ? ticket.user.name : null,
    checkedInAt: ticket.checkedInAt,
  };
};

module.exports = {
  generateTicketId,
  signTicketPayload,
  parseTicketPayload,
  generateTicketsForBooking,
  getTicketForResponse,
  serializeTicket,
  verifyTicket,
};