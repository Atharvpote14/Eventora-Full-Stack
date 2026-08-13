require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const {
  errorMiddleware,
  notFoundMiddleware,
} = require("./middleware/errorMiddleware");

const app = express();

// Security headers
app.use(helmet());

// CORS — credentials required for httpOnly cookie auth
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", apiLimiter);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventora Backend API 🚀",
  });
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eventora API is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// 404 handler
app.use(notFoundMiddleware);

// Centralized error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Eventora API running on http://localhost:${PORT}`);
  });
};

startServer();
