"""
Economic Crisis / Recession Model Training  (v3 — SMOTE + Calibration)
=======================================================================
Root cause of the narrow 7–18% probability range:
  - 87%/13% class imbalance → model was always biased toward "no recession"
  - LogisticRegression was selected by AUC but produces poorly-separated probs

Fix strategy:
  1. SMOTE oversampling  → balances training classes to 50/50
  2. GradientBoosting    → better probability separation than LR
  3. CalibratedClassifierCV (isotonic) → well-calibrated 0–100% probabilities
  4. Score on F1 (not AUC) after SMOTE — AUC is less meaningful post-oversampling
"""

import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

DATA_PATH  = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/crisis_model.pkl")


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["Year", "Quarter"]).reset_index(drop=True)

    for col in ["GDP_Growth", "Inflation", "Industrial_Production", "Job_Market"]:
        df[f"{col}_lag1"] = df[col].shift(1)
        df[f"{col}_lag2"] = df[col].shift(2)

    for col in ["GDP_Growth", "Inflation", "Industrial_Production"]:
        df[f"{col}_roll4"] = df[col].rolling(4).mean()

    # Continuous composite stress score (higher = more stressed)
    df["stress_score"] = (
        -df["GDP_Growth"].clip(upper=0)           # negative GDP adds stress
        + df["Inflation"].clip(lower=0) * 0.5     # high inflation adds stress
        - df["Industrial_Production"].clip(upper=0) * 0.5
        + (100 - df["Job_Market"].clip(0, 100)) * 0.1  # weak job market adds
    )

    # Binary domain signals
    df["gdp_decline"]     = (df["GDP_Growth"] < 0).astype(int)
    df["ip_decline"]      = (df["Industrial_Production"] < 0).astype(int)
    df["gdp_and_ip_neg"]  = ((df["GDP_Growth"] < 0) & (df["Industrial_Production"] < 0)).astype(int)
    df["high_inflation"]  = (df["Inflation"] > 10).astype(int)
    df["job_market_weak"] = (df["Job_Market"] < 30).astype(int)
    df["dual_stress"]     = ((df["gdp_decline"] == 1) | (df["job_market_weak"] == 1)).astype(int)

    df = df.dropna().reset_index(drop=True)
    return df


FEATURES = [
    "GDP_Growth",
    "Inflation",
    "Industrial_Production",
    "Job_Market",
    "Quarter",
    "GDP_Growth_lag1", "GDP_Growth_lag2",
    "Inflation_lag1",  "Inflation_lag2",
    "Industrial_Production_lag1", "Industrial_Production_lag2",
    "Job_Market_lag1", "Job_Market_lag2",
    "GDP_Growth_roll4",
    "Inflation_roll4",
    "Industrial_Production_roll4",
    "stress_score",
    "gdp_decline",
    "ip_decline",
    "gdp_and_ip_neg",
    "high_inflation",
    "job_market_weak",
    "dual_stress",
]


def train_crisis_model(
    data_path: str = DATA_PATH,
    model_path: str = MODEL_PATH,
):
    print("\n" + "=" * 60)
    print("  RECESSION / CRISIS MODEL TRAINING  (v3: SMOTE + Calibration)")
    print("=" * 60)

    df = pd.read_csv(data_path)
    df = engineer_features(df)

    print(f"\n[INFO] Dataset rows: {len(df)}")
    print(f"[INFO] Class distribution BEFORE SMOTE:\n{df['Recession_Indicator'].value_counts().to_string()}")

    TARGET = "Recession_Indicator"
    X = df[FEATURES]
    y = df[TARGET]

    # ── Stratified train/test split (do NOT apply SMOTE on test set) ──────────
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(sss.split(X, y))
    X_train_raw, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train_raw, y_test = y.iloc[train_idx], y.iloc[test_idx]

    # ── Apply SMOTE only to training set ─────────────────────────────────────
    smote = SMOTE(random_state=42, k_neighbors=5)
    X_train, y_train = smote.fit_resample(X_train_raw, y_train_raw)

    print(f"\n[INFO] After SMOTE — Class distribution:")
    print(f"         0 (Normal):    {(y_train == 0).sum()}")
    print(f"         1 (Recession): {(y_train == 1).sum()}")

    # ── Model candidates (all with CalibratedClassifierCV for well-spread probs) ─
    # Note: We wrap each base estimator with isotonic calibration to ensure
    # predict_proba() spans a wide, meaningful 0–100% range.
    base_candidates = {
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=400, max_depth=4, learning_rate=0.05,
            subsample=0.8, min_samples_leaf=5, random_state=42
        ),
        "XGBoost": XGBClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            eval_metric="logloss", random_state=42, verbosity=0, n_jobs=-1
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, verbose=-1, n_jobs=-1
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=400, max_depth=8, min_samples_leaf=3,
            random_state=42, n_jobs=-1
        ),
    }

    best_model_obj = None
    best_f1 = -np.inf
    best_name = ""
    results = {}

    print(f"\n{'Model':<22} {'Accuracy':>10} {'F1':>8} {'AUC-ROC':>10} {'p_min':>7} {'p_max':>7}")
    print("-" * 68)

    for name, base in base_candidates.items():
        # Calibrate with isotonic regression (better for imbalanced after SMOTE)
        model = CalibratedClassifierCV(base, method="isotonic", cv=3)
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        f1  = f1_score(y_test, preds, zero_division=0)
        auc = roc_auc_score(y_test, proba)

        print(f"{name:<22} {acc:>10.4f} {f1:>8.4f} {auc:>10.4f} {proba.min():>7.3f} {proba.max():>7.3f}")

        results[name] = {"accuracy": acc, "f1": f1, "auc": auc}

        if f1 > best_f1:
            best_f1 = f1
            best_model_obj = model
            best_name = name

    # ── Verify probability separation with known extreme inputs ───────────────
    print("\n  Probability sanity check (direct feature vectors):")
    test_cases = [
        ("Low-Risk",   [5.5, 2.5, 3.0, 75, 2,  5.5,5.5,  2.5,2.5,  3.0,3.0,  75,75,  5.5,2.5,3.0,  0.0,  0,0,0,0,0,0]),
        ("Med-Risk",   [0.5, 9.5,-1.0, 40, 4,  0.5,0.5,  9.5,9.5, -1.0,-1.0,  40,40,  0.5,9.5,-1.0, 5.0,  0,1,0,0,0,1]),
        ("High-Risk",  [-2.5,14.0,-4.5,20, 1, -2.5,-2.5, 14.0,14.0,-4.5,-4.5,  20,20, -2.5,14.0,-4.5,12.0, 1,1,1,1,1,1]),
    ]
    for label, vec in test_cases:
        p = best_model_obj.predict_proba(pd.DataFrame([vec], columns=FEATURES))[0][1]
        print(f"    {label:<12} → Crisis Probability: {p*100:.1f}%")

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({"model": best_model_obj, "features": FEATURES}, model_path)

    print(f"\n[✓] Best model : {best_name}")
    print(f"[✓] F1 Score   : {best_f1:.4f}")
    print(f"[✓] Saved to   : {model_path}")
    return best_model_obj, results


if __name__ == "__main__":
    train_crisis_model()