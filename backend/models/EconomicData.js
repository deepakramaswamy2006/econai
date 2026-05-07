const mongoose = require("mongoose");

const EconomicDataSchema = new mongoose.Schema({

  country: String,
  year: Number,

  gdp: Number,
  gdp_per_capita: Number,
  inflation: Number,
  unemployment: Number,
  interest_rate: Number,
  exports: Number,
  imports: Number,
  government_spending: Number,
  debt_to_gdp: Number

});

module.exports = mongoose.model("EconomicData", EconomicDataSchema);