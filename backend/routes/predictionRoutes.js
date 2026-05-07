const express = require("express");
const { 
  predictGDP, 
  predictCrisis,
  predictInflation,
  getLatestReport,
  getExplanation,
  getNews,
  historicalData,
} = require("../controllers/predictionController");

const router = express.Router();

router.post("/predict-gdp", predictGDP);
router.post("/predict-crisis", predictCrisis);
router.post("/predict-inflation", predictInflation);
router.get("/latest-report", getLatestReport);
router.get("/historical-data", historicalData);
router.post("/explain", getExplanation);
router.get("/news", getNews);

module.exports = router;