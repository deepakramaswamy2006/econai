const EconomicData = require("../models/EconomicData");

exports.getEconomicData = async (req, res) => {

  try {

    const data = await EconomicData.find();

    res.json(data);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};