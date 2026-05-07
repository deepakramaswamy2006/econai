import pandas as pd

worldbank = pd.read_csv("../data/worldbank_data.csv")
fred = pd.read_csv("../data/fred_interest_rates.csv")

worldbank["year"] = pd.to_datetime(worldbank["date"]).dt.year
fred["year"] = pd.to_datetime(fred["date"]).dt.year

fred_yearly = fred.groupby("year").mean().reset_index()

dataset = pd.merge(
    worldbank,
    fred_yearly,
    on="year",
    how="inner"
)

dataset.to_csv("../data/macroeconomic_data.csv", index=False)

print("Merged macroeconomic dataset created")