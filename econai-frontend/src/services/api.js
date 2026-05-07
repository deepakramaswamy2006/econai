import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"
});

export const predictGDP = (data) => API.post("/predictions/predict-gdp", data);

export const predictCrisis = (data) => API.post("/predictions/predict-crisis", data);

export const predictInflation = (data) => API.post("/predictions/predict-inflation", data);

export const getHistoricalData = () => API.get("/predictions/historical-data");

export const getEconomicData = () => API.get("/economic-data");

export const getLatestReport = () => API.get("/predictions/latest-report");