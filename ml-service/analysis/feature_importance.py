import joblib
import pandas as pd

model = joblib.load("../models/gdp_model.pkl")

features = [
    "inflation",
    "GDP_Growth",
    "Industrial_Production",
    "Job_Market",
    "Recession_Indicator",
    "Quarter",
    "Inflation_lag1",
    "GDP_Growth_lag1",
    "Industrial_Production_lag1",
    "Job_Market_lag1",
    "GDP_Growth_roll4",
    "Inflation_roll4",
    "Industrial_Production_roll4",
    "infl_x_ip",
    "gdp_x_job",
    "high_infl",
    "neg_ip",
]

importance = model.feature_importances_

df = pd.DataFrame({
    "feature": features,
    "importance": importance
})

df.sort_values("importance", ascending=False).to_csv(
    "../data/feature_importance.csv",
    index=False
)