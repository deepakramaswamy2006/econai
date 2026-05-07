import os
import sys

# Add ml-service root to Python path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_pipeline.simulate_live_data import generate_live_data
from training.train_gdp_model import train_gdp_model
from training.train_crisis_model import train_crisis_model

def run_pipeline():
    print("=== STARTING AUTONOMOUS ML PIPELINE ===")
    
    print("\n--- Phase 1: Fetching Live Data ---")
    new_data = generate_live_data()
    if not new_data:
        print("Data collection failed. Aborting pipeline.")
        return
        
    print(f"New Data Collected: {new_data}")
    
    print("\n--- Phase 2: Retraining GDP Model ---")
    # Fixed absolute paths for the data and model
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "macroeconomic_data.csv")
    gdp_model_path = os.path.join(script_dir, "models", "gdp_model.pkl")
    train_gdp_model(data_path=data_path, model_path=gdp_model_path)
    
    print("\n--- Phase 3: Retraining Crisis Model ---")
    crisis_model_path = os.path.join(script_dir, "models", "crisis_model.pkl")
    train_crisis_model(data_path=data_path, model_path=crisis_model_path)
    
    print("\n=== PIPELINE COMPLETE ===")

if __name__ == "__main__":
    run_pipeline()
