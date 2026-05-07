require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./utils/db");

const economicRoutes = require("./routes/economicRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5176", "http://127.0.0.1:5176"],
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