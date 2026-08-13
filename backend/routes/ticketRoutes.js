const express = require("express");

const {
  getMyTickets,
  getTicket,
  verifyTicketHandler,
} = require("../controllers/ticketController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/my", authenticate, getMyTickets);
router.get("/:id", authenticate, getTicket);

router.post(
  "/verify",
  authenticate,
  authorize("organizer", "admin"),
  validate((body) => (body.ticketNumber ? {} : { ticketNumber: "ticketNumber is required" })),
  verifyTicketHandler
);

module.exports = router;