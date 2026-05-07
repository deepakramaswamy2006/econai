const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({

  name: String,
  region: String,
  currency: String,
  population: Number

});

module.exports = mongoose.model("Country", CountrySchema);