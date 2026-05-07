const express = require("express");

const {
  getEconomicData
} = require("../controllers/economicController");

const router = express.Router();

router.get("/", getEconomicData);

module.exports = router;