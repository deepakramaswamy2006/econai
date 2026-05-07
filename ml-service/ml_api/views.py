from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import joblib
import math
import numpy as np
import pandas as pd
import os

from utils.preprocessing import (
    preprocess_gdp_input,
    preprocess_inflation_input,
    INFLATION_FEATURES,
    GDP_FEATURES,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_model(path: str):
    """Load a model artifact saved as {'model': ..., 'features': ...}."""
    artifact = joblib.load(path)
    if isinstance(artifact, dict):
        return artifact["model"], artifact.get("features")
    return artifact, None   # old-style plain model


def _to_df(feature_vector: list, feature_names: list) -> pd.DataFrame:
    """Wrap a feature list in a DataFrame to avoid sklearn feature-name warnings."""
    return pd.DataFrame([feature_vector], columns=feature_names)


# ── Load models once at startup ───────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

gdp_model,       gdp_features       = _load_model(os.path.join(BASE_DIR, "models/gdp_model.pkl"))
inflation_model, inflation_features  = _load_model(os.path.join(BASE_DIR, "models/inflation_model.pkl"))

# Fall back to the constants in preprocessing if the pkl doesn't carry them
gdp_features       = gdp_features       or GDP_FEATURES
inflation_features = inflation_features or INFLATION_FEATURES

HISTORICAL_CSV = os.path.join(BASE_DIR, "data/dataset.csv")


# ── Prediction views ──────────────────────────────────────────────────────────

@api_view(["POST"])
def predict_gdp(request):
    """
    Predict GDP growth.
    Required fields: inflation, industrial_production, job_market,
                     recession_indicator, quarter [, year]
    """
    data = request.data
    feat_vec = preprocess_gdp_input(data)
    X = _to_df(feat_vec, gdp_features)
    prediction = gdp_model.predict(X)
    return Response({"predicted_gdp_growth": round(float(prediction[0]), 2)})


@api_view(["POST"])
def predict_crisis(request):
    """
    Predict recession / economic crisis probability (0-100%).

    Uses a calibrated domain-driven formula instead of the ML model because
    the training dataset's recession labels (only years 2020-2021) have
    GDP averaging ~5% — virtually identical to normal rows, making it
    impossible for any classifier to learn a meaningful separation.

    Formula: composite stress score → sigmoid → probability
    Calibrated so that:
      Low risk  (GDP=5.5, Infl=2.5, IP=3.0,  JM=75, Normal)   → ~5%
      Med risk  (GDP=0.5, Infl=9.5, IP=-1.0, JM=40, Normal)   → ~45%
      High risk (GDP=-2.5, Infl=14, IP=-4.5, JM=20, Recession) → ~85%
    """
    data = request.data
    try:
        gdp  = float(data.get("gdp_growth",            data.get("GDP_Growth",            4.5)))
        infl = float(data.get("inflation",              data.get("Inflation",             5.0)))
        ip   = float(data.get("industrial_production",  data.get("Industrial_Production", 1.0)))
        jm   = float(data.get("job_market",             data.get("Job_Market",           55.0)))
        rec  = float(data.get("recession_indicator",    data.get("Recession_Indicator",   0)))
    except (TypeError, ValueError) as e:
        return Response({"error": f"Invalid input: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    # Component scores (higher = more stressed economy)
    gdp_score  = -gdp * 4.0                        # GDP +5% → -20; GDP -2.5% → +10
    infl_score = max(0, infl - 5.0) * 2.0          # 5% threshold; 14% → +18
    ip_score   = max(0, -ip) * 3.0                 # IP -4.5% → +13.5
    jm_score   = max(0, 50 - jm) * 0.4             # JM=20 → +12; JM=75 → 0
    rec_boost  = rec * 15.0                         # Active recession flag → +15

    raw_score = gdp_score + infl_score + ip_score + jm_score + rec_boost

    # Sigmoid mapping: calibrated so that
    #   Low risk  → ~4%   (raw ≈ -22)
    #   Med risk  → ~46%  (raw ≈  14)
    #   High risk → ~97%  (raw ≈  68)
    probability = 1.0 / (1.0 + math.exp(-0.082 * (raw_score - 16.0)))
    probability = max(0.02, min(0.97, probability))  # clamp to 2–97%

    return Response({"crisis_probability": round(float(probability), 4)})


@api_view(["POST"])
def predict_inflation(request):
    """
    Predict inflation rate.
    Required fields: gdp_growth, industrial_production, job_market,
                     recession_indicator, quarter [, year]
    """
    data = request.data
    feat_vec = preprocess_inflation_input(data)
    X = _to_df(feat_vec, inflation_features)
    prediction = inflation_model.predict(X)
    predicted = float(prediction[0])
    predicted = max(0.0, min(predicted, 30.0))          # clamp to realistic range
    return Response({"predicted_inflation": round(predicted, 2)})


# ── Historical data view ──────────────────────────────────────────────────────

@api_view(["GET"])
def historical_data(request):
    """
    Returns historical macroeconomic data from the training dataset
    (2010–2025, quarterly aggregates) plus ML-generated forecasts for 2026–2028.
    """
    try:
        df = pd.read_csv(HISTORICAL_CSV)

        # Aggregate multiple simulation rows → one clean row per (Year, Quarter)
        agg = (
            df.groupby(["Year", "Quarter"])
            .agg(
                gdp_growth=("GDP_Growth", "mean"),
                inflation=("Inflation", "mean"),
                industrial_production=("Industrial_Production", "mean"),
                job_market=("Job_Market", "mean"),
                recession=("Recession_Indicator", "max"),
            )
            .reset_index()
        )
        agg.rename(columns={"Year": "year", "Quarter": "quarter"}, inplace=True)
        agg["year"] = agg["year"].astype(str)
        records = agg.round(3).to_dict(orient="records")

        # ── Forecasts for 2026-2028 ──────────────────────────────────────────
        last = agg.iloc[-1]
        prev = {
            "gdp_growth":            float(last["gdp_growth"]),
            "inflation":             float(last["inflation"]),
            "industrial_production": float(last["industrial_production"]),
            "job_market":            float(last["job_market"]),
            "recession_indicator":   0,
            "quarter":               4,
        }

        forecasts = []
        for year in [2026, 2027, 2028]:
            prev["year"] = year
            prev["quarter"] = 2     # mid-year representative quarter

            # Mild trend extrapolation
            prev["industrial_production"] = max(-5.0, prev["industrial_production"] - 0.1)
            prev["job_market"]            = max(60.0, prev["job_market"] - 0.5)

            gdp_vec  = preprocess_gdp_input(prev)
            infl_vec = preprocess_inflation_input(prev)

            Xg = _to_df(gdp_vec,  gdp_features)
            Xi = _to_df(infl_vec, inflation_features)

            forecast_gdp  = float(gdp_model.predict(Xg)[0])
            forecast_infl = float(inflation_model.predict(Xi)[0])

            # Use calibrated formula for crisis forecast too
            gdp_s  = -forecast_gdp * 4.0
            infl_s = max(0, forecast_infl - 5.0) * 2.0
            ip_s   = max(0, -prev["industrial_production"]) * 3.0
            jm_s   = max(0, 50 - prev["job_market"]) * 0.4
            raw    = gdp_s + infl_s + ip_s + jm_s
            forecast_crisis = 1.0 / (1.0 + math.exp(-0.12 * (raw - 5.0))) * 100

            prev["gdp_growth"] = forecast_gdp

            forecasts.append({
                "year":                   str(year),
                "quarter":                2,
                "gdp_growth":             None,
                "inflation":              None,
                "industrial_production":  None,
                "job_market":             None,
                "recession":              None,
                "forecast_gdp":           round(forecast_gdp, 2),
                "forecast_inflation":     round(max(0.0, min(forecast_infl, 30.0)), 2),
                "forecast_crisis":        round(max(2, min(97, forecast_crisis)), 1),
                "forecast_job_market":    round(prev["job_market"], 1),
                "is_forecast":            True,
            })

        # Mark historical records
        for r in records:
            r["is_forecast"]          = False
            r["forecast_gdp"]         = None
            r["forecast_inflation"]   = None
            r["forecast_crisis"]      = None
            r["forecast_job_market"]  = None

        return Response({"data": records + forecasts})

    except Exception as e:
        import traceback
        return Response(
            {"error": str(e), "detail": traceback.format_exc()},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )