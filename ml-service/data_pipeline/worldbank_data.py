import wbdata
import pandas as pd
from datetime import datetime

indicators = {
    "NY.GDP.MKTP.KD.ZG": "gdp_growth",
    "FP.CPI.TOTL.ZG": "inflation",
    "SL.UEM.TOTL.ZS": "unemployment"
}

data = wbdata.get_dataframe(
    indicators,
    country="USA",
    data_date=(datetime(2000,1,1), datetime(2023,1,1))
)

data.reset_index(inplace=True)

data.to_csv("../data/worldbank_data.csv", index=False)

print("World Bank data downloaded")