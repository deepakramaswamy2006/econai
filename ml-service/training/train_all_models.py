"""
train_all_models.py
===================
Master script: trains all three models (inflation, GDP, crisis) on the
new dataset and prints a summary of results.
"""

import sys
import os

# Ensure imports resolve correctly when run from any directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from train_inflation_model import train_inflation_model
from train_gdp_model import train_gdp_model
from train_crisis_model import train_crisis_model

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/dataset.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "../models")

if __name__ == "__main__":
    print("\n" + "█" * 62)
    print("  EconAI — Model Training Pipeline")
    print("  Dataset : data/dataset.csv")
    print("█" * 62)

    _, infl_results = train_inflation_model(
        data_path=DATA_PATH,
        model_path=os.path.join(MODELS_DIR, "inflation_model.pkl"),
    )

    _, gdp_results = train_gdp_model(
        data_path=DATA_PATH,
        model_path=os.path.join(MODELS_DIR, "gdp_model.pkl"),
    )

    _, crisis_results = train_crisis_model(
        data_path=DATA_PATH,
        model_path=os.path.join(MODELS_DIR, "crisis_model.pkl"),
    )

    print("\n" + "=" * 62)
    print("  TRAINING COMPLETE — Summary")
    print("=" * 62)
    print(f"  Inflation best R²  : {max(v['r2'] for v in infl_results.values()):.4f}")
    print(f"  GDP Growth best R²  : {max(v['r2'] for v in gdp_results.values()):.4f}")
    print(f"  Crisis best F1      : {max(v['f1'] for v in crisis_results.values()):.4f}")
    print("=" * 62 + "\n")
