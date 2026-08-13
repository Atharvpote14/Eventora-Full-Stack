const express = require("express");

const {
  getMyWishlist,
  addEventToWishlist,
  removeEventFromWishlist,
} = require("../controllers/wishlistController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyWishlist);
router.post("/:eventId", addEventToWishlist);
router.delete("/:eventId", removeEventFromWishlist);

module.exports = router;
