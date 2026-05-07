require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./utils/db");

const economicRoutes = require("./routes/economicRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/economic-data", economicRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("EconAI Backend Running");
});

// Changed to 5001 to avoid Apple AirTunes port conflict on 5000
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});