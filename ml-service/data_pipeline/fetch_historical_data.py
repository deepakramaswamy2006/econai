"""
Fetches real World Bank data for the USA (2000-2023) and saves it
as data/historical_usa.csv for use in the Historical Trends charts.
"""
import wbdata
import pandas as pd
from datetime import datetime
import os

INDICATORS = {
    "NY.GDP.MKTP.KD.ZG": "gdp_growth",       # GDP growth (annual %)
    "FP.CPI.TOTL.ZG": "inflation",             # Inflation, CPI (annual %)
    "SL.UEM.TOTL.ZS": "unemployment",          # Unemployment (% of labor force)
    "FR.INR.RINR": "interest_rate",            # Real interest rate (%)
    "GC.DOD.TOTL.GD.ZS": "debt_to_gdp",       # Central gov debt (% of GDP)
}

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../data/historical_usa.csv")

def fetch_and_save():
    print("Fetching World Bank data for USA (2000-2023)...")
    try:
        df = wbdata.get_dataframe(
            INDICATORS,
            country="US",
            date=(datetime(2000, 1, 1), datetime(2023, 12, 31)),
        )
        df = df.reset_index()
        df = df.rename(columns={"date": "year"})
        df["year"] = df["year"].astype(str)
        df = df.sort_values("year").reset_index(drop=True)
        df = df.dropna(subset=["gdp_growth", "inflation", "unemployment"])
        df.to_csv(OUTPUT_PATH, index=False)
        print(f"Saved {len(df)} rows to {OUTPUT_PATH}")
        print(df[["year", "gdp_growth", "inflation", "unemployment"]].tail(10).to_string(index=False))
    except Exception as e:
        print(f"Error fetching World Bank data: {e}")

if __name__ == "__main__":
    fetch_and_save()
