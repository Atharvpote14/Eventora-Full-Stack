const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE || 0);
const BOOKING_EXPIRY_MINUTES = Number(process.env.BOOKING_EXPIRY_MINUTES || 15);
const MAX_QUANTITY = 10;

const generateBookingReference = () =>
  `EVT-${crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8)}`;

const calculatePricing = (unitPrice, quantity) => {
  const subtotal = unitPrice * quantity;
  const fees = PLATFORM_FEE;
  return { subtotal, fees, total: subtotal + fees };
};

const findTicketType = (event, ticketTypeId) =>
  event.ticketTypes.find(
    (t) => t._id.toString() === ticketTypeId.toString()
  );

const ticketAvailability = (ticket) =>
  Math.max(0, ticket.capacity - ticket.sold);

const reserveTickets = async (eventId, ticketTypeId, quantity, expectedSold) => {
  const ticketTypeObjectId = new mongoose.Types.ObjectId(ticketTypeId);

  const updated = await Event.findOneAndUpdate(
    { _id: eventId, "ticketTypes._id": ticketTypeObjectId },
    [
      {
        $set: {
          ticketTypes: {
            $map: {
              input: "$ticketTypes",
              as: "t",
              in: {
                $cond: [
                  { $eq: ["$$t._id", ticketTypeObjectId] },
                  {
                    $cond: [
                      {
                        $lte: [{ $add: ["$$t.sold", quantity] }, "$$t.capacity"],
                      },
                      {
                        $mergeObjects: [
                          "$$t",
                          { sold: { $add: ["$$t.sold", quantity] } },
                        ],
                      },
                      "$$t",
                    ],
                  },
                  "$$t",
                ],
              },
            },
          },
        },
      },
    ],
    { new: true }
  );

  if (!updated) return null;

  const target = updated.ticketTypes.find(
    (t) => t._id.toString() === ticketTypeId.toString()
  );
  if (!target || target.sold !== expectedSold + quantity) return null;

  return updated;
};

const releaseTickets = async (eventId, ticketTypeId, quantity) => {
  const ticketTypeObjectId = new mongoose.Types.ObjectId(ticketTypeId);

  await Event.updateOne(
    { _id: eventId, "ticketTypes._id": ticketTypeObjectId },
    [
      {
        $set: {
          ticketTypes: {
            $map: {
              input: "$ticketTypes",
              as: "t",
              in: {
                $cond: [
                  { $eq: ["$$t._id", ticketTypeObjectId] },
                  {
                    $mergeObjects: [
                      "$$t",
                      {
                        sold: {
                          $max: [{ $subtract: ["$$t.sold", quantity] }, 0],
                        },
                      },
                    ],
                  },
                  "$$t",
                ],
              },
            },
          },
        },
      },
    ]
  );
};

const expirePendingBookings = async () => {
  const now = new Date();
  const expired = await Booking.find({
    bookingStatus: "pending",
    paymentStatus: { $in: ["pending", "created"] },
    expiresAt: { $lte: now },
  });

  for (const booking of expired) {
    await releaseTickets(booking.event, booking.ticketTypeId, booking.quantity);
    booking.bookingStatus = "expired";
    await booking.save();
  }

  return expired.length;
};

const serializeBooking = (booking) => ({
  _id: booking._id,
  reference: booking.bookingReference,
  event: booking.event,
  ticketType: {
    _id: booking.ticketTypeId,
    name: booking.ticketType,
    price: booking.unitPrice,
  },
  quantity: booking.quantity,
  unitPrice: booking.unitPrice,
  subtotal: booking.subtotal,
  fees: booking.fees,
  total: booking.amount,
  bookingStatus: booking.bookingStatus,
  paymentStatus: booking.paymentStatus,
  expiresAt: booking.expiresAt,
  bookingDate: booking.bookingDate,
  createdAt: booking.createdAt,
});

module.exports = {
  PLATFORM_FEE,
  BOOKING_EXPIRY_MINUTES,
  MAX_QUANTITY,
  generateBookingReference,
  calculatePricing,
  findTicketType,
  ticketAvailability,
  reserveTickets,
  releaseTickets,
  expirePendingBookings,
  serializeBooking,
};