const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({

  country: String,
  year: Number,

  predicted_gdp_growth: Number,
  crisis_probability: Number,
  model_used: String,

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Prediction", PredictionSchema);