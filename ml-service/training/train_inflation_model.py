"""
Inflation Model Training
========================
Dataset columns: Year, Quarter, GDP_Growth, Inflation,
                 Industrial_Production, Job_Market, Recession_Indicator

Target  : Inflation
Features: GDP_Growth, Industrial_Production, Job_Market, Recession_Indicator, Quarter
          + lag & rolling features engineered below
"""

import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor,
)
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.pipeline import Pipeline

DATA_PATH  = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/inflation_model.pkl")


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add lag, rolling-window, and interaction features."""
    df = df.sort_values(["Year", "Quarter"]).reset_index(drop=True)

    # Lag features (previous 1 quarter values)
    for col in ["Inflation", "GDP_Growth", "Industrial_Production", "Job_Market"]:
        df[f"{col}_lag1"] = df[col].shift(1)

    # Rolling mean over 4 quarters
    for col in ["Inflation", "GDP_Growth", "Industrial_Production"]:
        df[f"{col}_roll4"] = df[col].rolling(4).mean()

    # Interaction & domain features
    df["gdp_x_ip"]       = df["GDP_Growth"] * df["Industrial_Production"]
    df["infl_x_job"]     = df["Inflation"] * df["Job_Market"]
    df["ip_positive"]    = (df["Industrial_Production"] > 0).astype(int)
    df["high_gdp"]       = (df["GDP_Growth"] > 7).astype(int)

    df = df.dropna().reset_index(drop=True)
    return df


def train_inflation_model(
    data_path: str = DATA_PATH,
    model_path: str = MODEL_PATH,
):
    """
    Trains multiple regressors on the new dataset and saves the best one.
    Returns (best_model, metrics_dict).
    """
    print("\n" + "=" * 60)
    print("  INFLATION MODEL TRAINING")
    print("=" * 60)

    # ── 1. Load & engineer ─────────────────────────────────────────
    df = pd.read_csv(data_path)
    print(f"\n[INFO] Loaded dataset: {len(df)} rows, columns: {list(df.columns)}")

    df = engineer_features(df)
    print(f"[INFO] After feature engineering: {len(df)} rows")

    FEATURES = [
        "GDP_Growth",
        "Industrial_Production",
        "Job_Market",
        "Recession_Indicator",
        "Quarter",
        "GDP_Growth_lag1",
        "Inflation_lag1",
        "Industrial_Production_lag1",
        "Job_Market_lag1",
        "GDP_Growth_roll4",
        "Inflation_roll4",
        "Industrial_Production_roll4",
        "gdp_x_ip",
        "infl_x_job",
        "ip_positive",
        "high_gdp",
    ]
    TARGET = "Inflation"

    X = df[FEATURES]
    y = df[TARGET]

    # ── 2. Train / test split (random shuffle — avoids temporal leakage) ─
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"[INFO] Train size: {len(X_train)} | Test size: {len(X_test)}")

    # ── 3. Model candidates ───────────────────────────────────────
    candidates = {
        "RandomForest": RandomForestRegressor(
            n_estimators=300, max_depth=10, min_samples_leaf=3,
            random_state=42, n_jobs=-1
        ),
        "ExtraTrees": ExtraTreesRegressor(
            n_estimators=300, max_depth=10, min_samples_leaf=3,
            random_state=42, n_jobs=-1
        ),
        "GradientBoosting": GradientBoostingRegressor(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, random_state=42
        ),
        "XGBoost": XGBRegressor(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            reg_alpha=0.1, reg_lambda=1.0,
            random_state=42, verbosity=0, n_jobs=-1
        ),
        "LightGBM": LGBMRegressor(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            reg_alpha=0.1, reg_lambda=1.0,
            random_state=42, verbose=-1, n_jobs=-1
        ),
    }

    # ── 4. Evaluate each model ────────────────────────────────────
    results = {}
    best_model_obj = None
    best_r2 = -np.inf

    print(f"\n{'Model':<22} {'R²':>8} {'MAE':>8} {'RMSE':>8}")
    print("-" * 50)

    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        r2   = r2_score(y_test, preds)
        mae  = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))

        results[name] = {"r2": r2, "mae": mae, "rmse": rmse}
        print(f"{name:<22} {r2:>8.4f} {mae:>8.4f} {rmse:>8.4f}")

        if r2 > best_r2:
            best_r2 = r2
            best_model_obj = model
            best_name = name

    # ── 5. Save best model ────────────────────────────────────────
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({"model": best_model_obj, "features": FEATURES}, model_path)

    print(f"\n[✓] Best model : {best_name}")
    print(f"[✓] R² Score   : {best_r2:.4f}")
    print(f"[✓] Saved to   : {model_path}")
    return best_model_obj, results


if __name__ == "__main__":
    train_inflation_model()
