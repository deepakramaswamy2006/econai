const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL;

exports.predictGDP = async (data) => {
  const response = await axios.post(`${ML_URL}/ml/predict-gdp`, data);
  return response.data;
};

exports.predictCrisis = async (data) => {
  const response = await axios.post(`${ML_URL}/ml/predict-crisis`, data);
  return response.data;
};

exports.predictInflation = async (data) => {
  const response = await axios.post(`${ML_URL}/ml/predict-inflation`, data);
  return response.data;
};

exports.getHistoricalData = async () => {
  const response = await axios.get(`${ML_URL}/ml/historical-data`);
  return response.data;
};