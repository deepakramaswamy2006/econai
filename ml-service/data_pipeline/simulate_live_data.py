import pandas as pd
import numpy as np
import os

# Use absolute path relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "../data/macroeconomic_data.csv")

def generate_live_data():
    """Simulate fetching live data and appending to the dataset"""
    try:
        if os.path.exists(DATA_FILE):
            df = pd.read_csv(DATA_FILE)
            last_row = df.iloc[-1]
            
            # Generate new values with some random walk drift
            new_inflation = max(0, last_row['inflation'] + np.random.normal(0, 0.5))
            new_unemployment = max(0, last_row['unemployment'] + np.random.normal(0, 0.2))
            new_interest = max(0, last_row['interest_rate'] + np.random.normal(0, 0.25))
            new_debt = max(0, last_row['debt_to_gdp'] + np.random.normal(0, 1.0))
            
            new_gdp_growth = last_row['gdp_growth'] + np.random.normal(0, 0.2)
            new_crisis = 1 if new_debt > 80 and new_inflation > 5 else 0
            
            new_row = {
                'inflation': new_inflation,
                'unemployment': new_unemployment,
                'interest_rate': new_interest,
                'debt_to_gdp': new_debt,
                'gdp_growth': new_gdp_growth,
                'crisis': new_crisis
            }
            
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            df.to_csv(DATA_FILE, index=False)
            print("Successfully simulated and appended new macroeconomic data.")
            return new_row
            
        else:
            print(f"Error: {DATA_FILE} not found.")
            return None
    except Exception as e:
        print(f"Error generating data: {e}")
        return None

if __name__ == "__main__":
    generate_live_data()
