from fredapi import Fred
import pandas as pd

fred = Fred(api_key="YOUR_FRED_API_KEY")

interest = fred.get_series("FEDFUNDS")

df = interest.reset_index()
df.columns = ["date", "interest_rate"]

df.to_csv("../data/fred_interest_rates.csv", index=False)

print("FRED interest rate data downloaded")