const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === "YOUR_MONGO_URI") {
        console.warn("MongoDB URI not provided. Skipping database connection.");
        return;
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error.message);
    console.warn("Continuing without MongoDB connection. Some features may not work.");
    // Removing process.exit(1) so the server can still start and serve the live AI report
  }
};

module.exports = connectDB;