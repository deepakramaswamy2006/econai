import pandas as pd
from pymongo import MongoClient

client = MongoClient("YOUR_MONGO_URI")

db = client["econai-db"]

collection = db["macro_data"]

df = pd.read_csv("../data/macroeconomic_data.csv")

data = df.to_dict("records")

collection.insert_many(data)

print("Dataset inserted into MongoDB")