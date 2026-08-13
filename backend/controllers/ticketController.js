const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { serializeTicket, verifyTicket } = require("../services/ticketService");

const getMyTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const status = req.query.status;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("event", "title date time venue city slug")
      .populate("booking", "bookingReference"),
    Ticket.countDocuments(filter),
  ]);

  const data = [];
  for (const t of tickets) {
    data.push(await serializeTicket(t));
  }

  return successResponse(res, {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id)
    .populate("event", "title date time venue city slug organizer")
    .populate("user", "name email")
    .populate("booking", "bookingReference");

  if (!ticket) throw new ApiError(404, "Ticket not found.");

  const isOwner = ticket.user._id.toString() === req.user._id.toString();
  const isOrganizer =
    req.user.role === "organizer" &&
    ticket.event.organizer &&
    ticket.event.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isOrganizer && !isAdmin) {
    throw new ApiError(403, "You do not have permission to view this ticket.");
  }

  return successResponse(res, {
    message: "Ticket retrieved.",
    data: await serializeTicket(ticket),
  });
});

const verifyTicketHandler = asyncHandler(async (req, res) => {
  const { ticketNumber } = req.body;

  if (!ticketNumber) {
    throw new ApiError(400, "ticketNumber is required.");
  }

  const isAdmin = req.user.role === "admin";
  const result = await verifyTicket({
    payload: ticketNumber,
    verifierId: req.user._id,
    isAdmin,
  });

  return successResponse(res, {
    message: "Ticket verified. Check-in successful.",
    data: result,
  });
});

module.exports = { getMyTickets, getTicket, verifyTicketHandler };