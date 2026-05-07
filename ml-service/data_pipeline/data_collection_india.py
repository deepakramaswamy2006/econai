import wbdata
import pandas as pd
import datetime

# -----------------------------
# STEP 1: Define date range
# -----------------------------
start = datetime.datetime(2000, 1, 1)
end = datetime.datetime(2023, 1, 1)

# -----------------------------import pandas as pd

# -----------------------------
# STEP 1: Load dataset
# -----------------------------
df = pd.read_csv("your_dataset.csv")   # <-- replace with your file name

print("Original Data:")
print(df.head())

# -----------------------------
# STEP 2: Fix Quarter (Q1 → 1)
# -----------------------------
quarter_map = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}
df["Quarter"] = df["Quarter"].map(quarter_map)

# -----------------------------
# STEP 3: Sort data (VERY IMPORTANT)
# -----------------------------
df = df.sort_values(["Year", "Quarter"]).reset_index(drop=True)

# -----------------------------
# STEP 4: Fix Job_Market scaling
# -----------------------------
# Convert large numbers into smaller scale
df["Job_Market"] = df["Job_Market"] / 1000

# -----------------------------
# STEP 5: Handle missing values (if any)
# -----------------------------
df = df.fillna(method="ffill")

# -----------------------------
# STEP 6: Check data
# -----------------------------
print("\nCleaned Data:")
print(df.head())

# -----------------------------
# STEP 7: Save cleaned dataset
# -----------------------------
df.to_csv("cleaned_dataset.csv", index=False)

print("\n✅ Cleaned dataset saved as cleaned_dataset.csv")
# STEP 2: Country code for India
# -----------------------------
country = "IND"

# -----------------------------
# STEP 3: Indicators (World Bank)
# -----------------------------
indicators = {
    "NY.GDP.MKTP.KD.ZG": "gdp_growth",
    "FP.CPI.TOTL.ZG": "inflation",
    "SL.UEM.TOTL.ZS": "unemployment",
    "GC.DOD.TOTL.GD.ZS": "debt_to_gdp"
}

# -----------------------------
# STEP 4: Fetch data
# -----------------------------
data = wbdata.get_dataframe(indicators, country=country)

# -----------------------------
# STEP 5: Clean data
# -----------------------------
data = data.reset_index()
data.rename(columns={"date": "year"}, inplace=True)
data["year"] = data["year"].astype(int)
data = data.sort_values("year")

# -----------------------------
# STEP 6: Add interest rate (manual placeholder)
# -----------------------------
data["interest_rate"] = 5.5

# -----------------------------
# STEP 7: Create crisis label
# -----------------------------
def label_crisis(row):
    if row["gdp_growth"] < 0 or row["unemployment"] > 7:
        return 1
    return 0

data["crisis"] = data.apply(label_crisis, axis=1)

# -----------------------------
# STEP 8: Save CSV
# -----------------------------
data.to_csv("india_macro_data.csv", index=False)

print("✅ India dataset created successfully!")