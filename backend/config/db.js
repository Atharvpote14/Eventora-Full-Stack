const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "[db] MONGODB_URI not set — skipping database connection. Add it to backend/.env"
    );
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[db] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
